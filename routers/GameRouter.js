const {Router} = require('express')
const GameController = require('../controllers/GameController')

const router = new Router()

router.post('/get_games', GameController.getGames)
router.post('/get_game', GameController.getGame)
router.post('/create_game', GameController.createGame)
router.post('/update_game', GameController.updateGame)
router.post('/remove_game', GameController.removeGame)

module.exports = router