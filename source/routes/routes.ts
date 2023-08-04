/** source/routes/posts.ts */
import express from 'express';
import routers from '../controllers/routers';
import controller from '../controllers/routers';
import standardRoutes from '../controllers/standard-routes';
const router = express.Router({mergeParams: true});

router.get('/steam/:id/summary', controller.steamSummary);
router.get('/steam/:id/recently-played', controller.steamRecentlyPlayed)
router.get('/catto', routers.dailyCatto)
router.get('/steam/:id/summary/svg', controller.steamSummarySvg)
router.get('/doggo', routers.dailyDoggo)
router.get('/psn/:id/summary', controller.psnSummary)
router.get('/psn/:id/summary/svg', controller.psnSummarySVG)
router.get('/moon-phase/svg', controller.moonPhaseSVG)
router.get('/anilist-manga/:id/recent/svg', controller.anilistMangaSVG)

router.get('/health', standardRoutes.health)
router.get('/version', standardRoutes.version)


export = router;