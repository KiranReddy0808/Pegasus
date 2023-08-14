/** source/routes/posts.ts */
import express from 'express';
import routers from '../controllers/routers';
import controller from '../controllers/routers';
import standardRoutes from '../controllers/standard-routes';
const router = express.Router({mergeParams: true});

router.get('/catto', routers.dailyCatto)
router.get('/steam/:id/summary/svg', controller.steamSummarySvg)
router.get('/doggo', routers.dailyDoggo)
router.get('/psn/:id/summary/svg', controller.psnSummarySVG)
router.get('/moon-phase/svg', controller.moonPhaseSVG)
router.get('/anilist-manga/:id/recent/svg', controller.anilistMangaSVG)

router.get('/health', standardRoutes.health)
router.get('/version', standardRoutes.version)


export = router;