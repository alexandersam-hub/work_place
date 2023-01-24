const {Router} = require('express')
const LocationController = require('../controllers/LocationController')

const router = new Router()

router.post('/update_location', LocationController.updateLocation)
router.post('/get_locations', LocationController.getLocations)
router.post('/create_location', LocationController.createLocation)
router.post('/remove_location', LocationController.removeLocation)

module.exports = router