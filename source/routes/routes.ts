/** source/routes/posts.ts */
import express from 'express';
import routers from '../controllers/routers';
import controller from '../controllers/routers';
import standardRoutes from '../controllers/standard-routes';
const router = express.Router({mergeParams: true});

router.get('/catto', routers.dailyCatto)
router.get('/steam/:id/summary', controller.steamSummarySvg)
router.get('/doggo', routers.dailyDoggo)
router.get('/psn/:id/summary', controller.psnSummarySVG)
router.get('/moon-phase', controller.moonPhaseSVG)
router.get('/anilist-manga/:id/recent', controller.anilistMangaSVG)
router.get('/anilist-anime/:id/recent', controller.anilistAnimeSVG)

router.get('/health', standardRoutes.health)
router.get('/version', standardRoutes.version)


export = router;