import { DiagnosticSeverity } from "@stoplight/types";
import { oas2, oas3, oas3_0, oas3_1 } from "@stoplight/spectral-formats";
import {
  pattern,
  undefined,
  unreferencedReusableObject,
  xor,
} from "@stoplight/spectral-functions";
import {
  oasDiscriminator,
  oasDocumentSchema,
  oasExample,
  oasOpFormDataConsumeCheck,
  oasOpIdUnique,
  oasOpParams,
  oasOpSecurityDefined,
  oasPathParam,
  oasSchema,
  oasUnusedComponent,
  refSiblings,
  typedEnum,
  uniquenessTags, // TODO(ps) copied from rulesets/shared, could be moved into core?
} from "./functions";

export default {
  documentationUrl:
    "https://meta.stoplight.io/docs/spectral/4dec24461f3af-open-api-rules",
  formats: [oas2, oas3, oas3_0, oas3_1],
  aliases: {
    PathItem: ["$.paths[*]"],
    OperationObject: [
      "#PathItem[get,put,post,delete,options,head,patch,trace]",
    ],
  },
  rules: {
    "duplicated-entry-in-enum": {
      message: "{{error}}.",
      description:
        "Enum must not have duplicate entries. Duplicates can break various tools in the chain depending on how well they're built and which language they're written in. This will be especially problematic for code generation tooling.",
      severity: DiagnosticSeverity.Warning,
      given: ["$..[?(@property !== 'properties' && @ && @.enum)]"],
      then: {
        field: "enum",
        function: oasSchema,
        functionOptions: {
          schema: {
            type: "array",
            uniqueItems: true,
          },
        },
      },
    },
    "oas2-operation-formData-consume-check": {
      message:
        "Operations with formData must declare a content type that accepts form data.",
      description:
        "Operations with `in: formData` parameter must include `application/x-www-form-urlencoded` or `multipart/form-data` in the `consumes` property.",
      severity: DiagnosticSeverity.Warning,
      formats: [oas2],
      given: "#OperationObject",
      then: {
        function: oasOpFormDataConsumeCheck,
      },
    },
    "operation-operationId-unique": {
      message: 'Multiple operations exist with operationId "{{value}}".',
      description:
        "Unique string used to identify the operation. The id MUST be unique among all operations described in the API. Tools and libraries may use the operationId to uniquely identify an operation, therefore, it is recommended to follow common programming naming conventions.",
      severity: DiagnosticSeverity.Error,
      given: "$",
      then: {
        function: oasOpIdUnique,
      },
    },
    "operation-parameters": {
      message: "{{error}}.",
      description:
        "Operation parameters must be unique for their type, e.g. you could have a property called `name` in both the path and the query string, but cannot have two path parameters with the same name.",
      severity: DiagnosticSeverity.Warning,
      given: "#OperationObject.parameters",
      then: {
        function: oasOpParams,
      },
    },
    "path-params": {
      message: "{{error}}.",
      description: "Path parameters must be defined and valid.",
      severity: DiagnosticSeverity.Error,
      given: "$",
      then: {
        function: oasPathParam,
      },
    },
    "no-eval-in-markdown": {
      message: 'Markdown description contains "eval(".',
      description:
        "Potential cross-site scripting issues can happen when JavaScript like `eval()` is embedded in Markdown/HTML.",
      severity: DiagnosticSeverity.Warning,
      given: "$..[description,title]",
      then: {
        function: pattern,
        functionOptions: {
          notMatch: "eval\\(",
        },
      },
    },
    "no-script-tags-in-markdown": {
      message: 'Markdown description contains "<script>" tag.',
      description:
        "Potential cross-site scripting issues can happen when JavaScript like `<script>` is embedded in Markdown/HTML.",
      severity: DiagnosticSeverity.Warning,
      given: "$..[description,title]",
      then: {
        function: pattern,
        functionOptions: {
          notMatch: "<script",
        },
      },
    },
    "openapi-tags-uniqueness": {
      message: "{{error}}.",
      description:
        "According to the OpenAPI specification each tag name in the list MUST be unique.",
      severity: DiagnosticSeverity.Error,
      given: "$.tags",
      then: {
        function: uniquenessTags,
      },
    },
    "path-declarations-must-exist": {
      message: "Path parameters need to contain a name.",
      description:
        'When paths parameters are defined in the path they need a name between the curly braces, so that they can be matched up to an entry in parameters. For example, "/widgets/{}" is invalid.',
      severity: DiagnosticSeverity.Warning,
      given: "$.paths",
      then: {
        field: "@key",
        function: pattern,
        functionOptions: {
          notMatch: "{}",
        },
      },
    },
    "path-keys-no-trailing-slash": {
      message: "Path must not end with slash.",
      description:
        "Skip the / at the end of the path, because most web application frameworks consider /foo and /foo/ to be the same thing, and defining that last / is just asking for confusion.",
      severity: DiagnosticSeverity.Warning,
      given: "$.paths",
      then: {
        field: "@key",
        function: pattern,
        functionOptions: {
          notMatch: ".+\\/$",
        },
      },
    },
    "path-not-include-query": {
      message: "Path must not include query string.",
      description:
        "Defining a query string in the path directly in unspecified behavior. The OpenAPI Specificaction does not explicity forbid it, but it also does not say it is possible, and most tooling will break if you use this. Whenever uncertainty like this occurs, it is best to use the specified approach, and define query string parameters with `parameters` and `- in: query`.",
      severity: DiagnosticSeverity.Warning,
      given: "$.paths",
      then: {
        field: "@key",
        function: pattern,
        functionOptions: {
          notMatch: "\\?",
        },
      },
    },
    "no-ref-siblings": {
      message: "{{error}}.",
      description:
        "In older versions of OpenAPI (v2 and v3.0) it was not permitted to place any keywords next to `$ref`. Some tools would ignore them, some would incorrectly merge them, but behavior differed between tools. In v3.1 `$ref` siblings are permitted inside `schema` and in some other locations. Please refer to the specification for more information.",
      formats: [oas2, oas3_0],
      severity: DiagnosticSeverity.Error,
      resolved: false,
      given: "$..[?(@property === '$ref')]",
      then: {
        function: refSiblings,
      },
    },
    "typed-enum": {
      message: "{{error}}.",
      description:
        "Enum values must respect the specified type, meaning if the enum is a string then the values cannot be integers or arrays.",
      severity: DiagnosticSeverity.Warning,
      given: "$..[?(@ && @.enum && @.type)]",
      then: {
        function: typedEnum,
      },
    },
    "oas2-discriminator": {
      message: "{{error}}.",
      description: "discriminator property must be defined and required",
      severity: DiagnosticSeverity.Error,
      formats: [oas2],
      given: "$.definitions[?(@.discriminator)]",
      then: {
        function: oasDiscriminator,
      },
    },

    "oas2-host-trailing-slash": {
      message: "Server URL must not have trailing slash.",
      description:
        "Adding a trailing slash to the API server URL can confuse some tools, which will concat the server and the path (which already has a preceeding slash). This can lead to confusing errors where the full server + path looks like `https://example.com//widgets`.",
      severity: DiagnosticSeverity.Warning,
      formats: [oas2],
      given: "$",
      then: {
        field: "host",
        function: pattern,
        functionOptions: {
          notMatch: "/$",
        },
      },
    },
    "oas2-operation-security-defined": {
      message: "{{error}}.",
      description:
        'Operation "security" values must match a scheme defined in the "securityDefinitions" object.',
      severity: DiagnosticSeverity.Warning,
      formats: [oas2],
      given: "$",
      then: {
        function: oasOpSecurityDefined,
        functionOptions: {
          schemesPath: ["securityDefinitions"],
        },
      },
    },
    "oas2-valid-schema-example": {
      message: "{{error}}.",
      description: "Examples must be valid against their defined schema.",
      severity: DiagnosticSeverity.Error,
      formats: [oas2],
      given: [
        "$..definitions..[?(@property !== 'properties' && @ && (@.example !== void 0 || @['x-example'] !== void 0 || @.default !== void 0) && (@.enum || @.type || @.format || @.$ref || @.properties || @.items))]",
        "$..parameters..[?(@property !== 'properties' && @ && (@.example !== void 0 || @['x-example'] !== void 0 || @.default !== void 0) && (@.enum || @.type || @.format || @.$ref || @.properties || @.items))]",
        "$..responses..[?(@property !== 'properties' && @ && (@.example !== void 0 || @['x-example'] !== void 0 || @.default !== void 0) && (@.enum || @.type || @.format || @.$ref || @.properties || @.items))]",
      ],
      then: {
        function: oasExample,
        functionOptions: {
          schemaField: "$",
          oasVersion: 2,
          type: "schema",
        },
      },
    },
    "oas2-valid-media-example": {
      message: "{{error}}.",
      description: "Examples must be valid against their defined schema.",
      severity: DiagnosticSeverity.Error,
      formats: [oas2],
      given: "$..responses..[?(@ && @.schema && @.examples)]",
      then: {
        function: oasExample,
        functionOptions: {
          schemaField: "schema",
          oasVersion: 2,
          type: "media",
        },
      },
    },
    "oas2-anyOf": {
      message: '"anyOf" keyword must not be used in OpenAPI v2 document.',
      description:
        "anyOf is not available in OpenAPI v2, it was added in OpenAPI v3.",
      severity: DiagnosticSeverity.Warning,
      formats: [oas2],
      given: "$..anyOf",
      then: {
        function: undefined,
      },
    },
    "oas2-oneOf": {
      message: '"oneOf" keyword must not be used in OpenAPI v2 document.',
      description:
        "oneOf is not available in OpenAPI v2, it was added in OpenAPI v3.",
      severity: DiagnosticSeverity.Warning,
      formats: [oas2],
      given: "$..oneOf",
      then: {
        function: undefined,
      },
    },
    "oas2-schema": {
      message: "{{error}}.",
      description:
        "Validate the document against the OpenAPI v2 specification using the official JSON Schema version of the specification.",
      severity: DiagnosticSeverity.Error,
      formats: [oas2],
      given: "$",
      then: {
        function: oasDocumentSchema,
      },
    },
    "oas2-unused-definition": {
      message: "Potentially unused definition has been detected.",
      description:
        'Unused definitions are essentially "dead code" and should be avoided, as people might start using them thinking they are production ready despite them being dead code for an unknown amount of time.',
      severity: DiagnosticSeverity.Warning,
      resolved: false,
      formats: [oas2],
      given: "$.definitions",
      then: {
        function: unreferencedReusableObject,
        functionOptions: {
          reusableObjectsLocation: "#/definitions",
        },
      },
    },

    "oas3-examples-value-or-externalValue": {
      message: 'Examples must have either "value" or "externalValue" field.',
      description:
        "The OpenAPI specification allows either `value` or `externalValue`, but not both at once.",
      severity: DiagnosticSeverity.Warning,
      formats: [oas3],
      given: [
        "$.components.examples[*]",
        "$.paths[*][*]..content[*].examples[*]",
        "$.paths[*][*]..parameters[*].examples[*]",
        "$.components.parameters[*].examples[*]",
        "$.paths[*][*]..headers[*].examples[*]",
        "$.components.headers[*].examples[*]",
      ],
      then: {
        function: xor,
        functionOptions: {
          properties: ["externalValue", "value"],
        },
      },
    },
    "oas3-operation-security-defined": {
      message: "{{error}}.",
      description:
        'Operation "security" values must match a scheme defined in the `components.securitySchemes` object.',
      severity: DiagnosticSeverity.Warning,
      formats: [oas3],
      given: "$",
      then: {
        function: oasOpSecurityDefined,
        functionOptions: {
          schemesPath: ["components", "securitySchemes"],
        },
      },
    },
    "oas3-server-trailing-slash": {
      message: "Server URL must not have trailing slash.",
      description:
        "Adding a trailing slash to the API server URL can confuse some tools, which will concat the server and the path (which already has a preceeding slash). This can lead to confusing errors where the full server + path looks like `https://example.com//widgets`.",
      severity: DiagnosticSeverity.Warning,
      formats: [oas3],
      given: "$.servers[*].url",
      then: {
        function: pattern,
        functionOptions: {
          notMatch: "./$",
        },
      },
    },
    "oas3-valid-media-example": {
      message: "{{error}}.",
      description: "Examples must be valid against their defined schema.",
      severity: DiagnosticSeverity.Error,
      formats: [oas3],
      given: [
        "$..content..[?(@ && @.schema && (@.example !== void 0 || @.examples))]",
        "$..headers..[?(@ && @.schema && (@.example !== void 0 || @.examples))]",
        "$..parameters..[?(@ && @.schema && (@.example !== void 0 || @.examples))]",
      ],
      then: {
        function: oasExample,
        functionOptions: {
          schemaField: "schema",
          oasVersion: 3,
          type: "media",
        },
      },
    },
    "oas3-valid-schema-example": {
      message: "{{error}}.",
      description: "Examples must be valid against their defined schema.",
      severity: DiagnosticSeverity.Error,
      formats: [oas3],
      given: [
        "$.components.schemas..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0) && (@.enum || @.type || @.format || @.$ref || @.properties || @.items))]",
        "$..content..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0) && (@.enum || @.type || @.format || @.$ref || @.properties || @.items))]",
        "$..headers..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0) && (@.enum || @.type || @.format || @.$ref || @.properties || @.items))]",
        "$..parameters..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0) && (@.enum || @.type || @.format || @.$ref || @.properties || @.items))]",
      ],
      then: {
        function: oasExample,
        functionOptions: {
          schemaField: "$",
          oasVersion: 3,
          type: "schema",
        },
      },
    },
    "oas3-schema": {
      message: "{{error}}.",
      description:
        "Validate the document against the OpenAPI v3 specification using the official JSON Schema version of the specification.",
      severity: DiagnosticSeverity.Error,
      formats: [oas3],
      given: "$",
      then: {
        function: oasDocumentSchema,
      },
    },
    "oas3-unused-component": {
      message: "Potentially unused component has been detected.",
      description:
        'Unused definitions are essentially "dead code" and should be avoided, as people might start using them thinking they are production ready despite them being dead code for an unknown amount of time.',
      severity: DiagnosticSeverity.Warning,
      formats: [oas3],
      resolved: false,
      given: "$",
      then: {
        function: oasUnusedComponent,
      },
    },
  },
};
