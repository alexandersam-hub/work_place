const { WebSocketServer } = require('ws');
const GameService = require('../services/games/GameService')
const TokenService = require('../services/users/TokenService')
const UserService = require('../services/users/UserService')
const LocationService = require('../services/games/LocationService')

class GameSocket{


    gamesStore = []
    locationsStore = []
    usersStore = []
    users = {}
    games = {}
    currentGame = {}

    async init(server, isLocalServer) {
        try {
            if (isLocalServer)
                this.ws = new WebSocketServer({port: 8100});
            else
                this.ws = new WebSocketServer({server});

            await this.restoreData()

            this.ws.on('connection', (ws) => {

                let user
                let game

                ws.on('message', async (data) => {
                    const messageData = JSON.parse(data)
                    switch (messageData.action){
                        case 'login':
                            const token = messageData.token
                            const userToken = TokenService.validationToken(token)
                            if (! userToken)
                                return ws.send(JSON.stringify({warning:true,action:'login', message:'bad token'}))

                            user = this.usersStore.find(u=>u.id === userToken.id)
                            if (user) {
                                if (user.role === 'admin')
                                    return ws.send(JSON.stringify({
                                        warning: false, games:this.gamesStore,
                                        action: 'login', user: user}))
                                else {
                                    return ws.send(JSON.stringify({
                                        warning: false,
                                        games: this.gamesStore,
                                        user,
                                        map: this.users[user.id],
                                        action: 'login',
                                        data: user
                                    }))

                                }

                            }
                            else
                                return ws.send(JSON.stringify({warning:true,action:'login', message:'bad token'}))

                        case 'start':
                            game = messageData.gameId
                            const g = this.games[game]
                            if (!this.currentGame[game]){
                                this.currentGame[game] = {
                                    adminsSockets: [],
                                    usersSockets: [],
                                    pairWinner :  g.roundPairScoreWin,
                                    pairLose : g.roundPairScoreLose,
                                    pairNone: g.roundPairScoreNone,
                                    aloneWinner: g.roundAloneScoreWin,
                                    aloneLose : g.roundAloneScoreLose,
                                    chat:[],
                                    game: g,
                                    scores: {},
                                    logs: []
                                }
                            }

                            if (user.role === 'admin')
                                this.currentGame[game].adminsSockets.push({ws:ws,user:user})
                            else
                                this.currentGame[game].usersSockets.push({ws:ws,user:user})
                            this.sendInfoGame(ws, this.currentGame[game])
                            return this.sendCategoryInfoGame( this.currentGame[game].adminsSockets,  this.currentGame[game])
                        case 'deReport':
                            const log = this.currentGame[game].logs.find(l=>l.user.id === user.id && l.report.round === messageData.report.round && l.isActive)
                            if (!log)
                                return
                            log.isActive = false
                            const deReport = log.report
                            if (deReport.typeTask === 'double'){
                                if (deReport.status === 'winner'){
                                    this.currentGame[game].scores[deReport.teamWinner].score -=  this.currentGame[game].pairWinner
                                    this.currentGame[game].scores[deReport.teamLose].score -=   this.currentGame[game].pairLose
                                    this.currentGame[game].scores[deReport.teamWinner][deReport.round].splice(this.currentGame[game].scores[deReport.teamWinner][deReport.round].indexOf( this.currentGame[game].pairWinner),1)
                                    this.currentGame[game].scores[deReport.teamLose][deReport.round].splice(this.currentGame[game].scores[deReport.teamLose][deReport.round].indexOf( this.currentGame[game].pairLose),1)
                                }else if(deReport.status === 'none'){
                                    this.currentGame[game].scores[deReport.team1].score -=  this.currentGame[game].pairNone
                                    this.currentGame[game].scores[deReport.team2].score -=   this.currentGame[game].pairNone
                                    this.currentGame[game].scores[deReport.team1][deReport.round].splice(this.currentGame[game].scores[deReport.team1][deReport.round].indexOf( this.currentGame[game].pairNone),1)
                                    this.currentGame[game].scores[deReport.team2][deReport.round].splice(this.currentGame[game].scores[deReport.team2][deReport.round].indexOf( this.currentGame[game].pairNone),1)
                                }else{
                                    this.currentGame[game].scores[deReport.team1].score -=  this.currentGame[game].pairLose
                                    this.currentGame[game].scores[deReport.team2].score -=   this.currentGame[game].pairLose
                                    this.currentGame[game].scores[deReport.team1][deReport.round].splice(this.currentGame[game].scores[deReport.team1][deReport.round].indexOf( this.currentGame[game].pairLose),1)
                                    this.currentGame[game].scores[deReport.team2][deReport.round].splice(this.currentGame[game].scores[deReport.team2][deReport.round].indexOf( this.currentGame[game].pairLose),1)

                                }
                            }    else if (deReport.typeTask === 'alone'){
                                    if (deReport.status === 'winner'){
                                        this.currentGame[game].scores[deReport.team].score -=   this.currentGame[game].aloneWinner
                                        this.currentGame[game].scores[deReport.team][deReport.round].splice(this.currentGame[game].scores[deReport.team][deReport.round].indexOf( this.currentGame[game].aloneWinner),1)
                                    }else{
                                        this.currentGame[game].scores[deReport.team].score -=   this.currentGame[game].aloneLose
                                        this.currentGame[game].scores[deReport.team][deReport.round].splice(this.currentGame[game].scores[deReport.team][deReport.round].indexOf( this.currentGame[game].aloneLose),1)

                                    }

                            }
                            this.sendInfoGame(ws, this.currentGame[game])
                            return this.sendCategoryInfoGame( this.currentGame[game].adminsSockets,  this.currentGame[game])
                        case 'report':
                            const report = messageData.report
                            this.currentGame[game].logs.push({date:Date.now(), user, report, isActive:true})
                            if (report.typeTask === 'double'){
                                if (report.status === 'winner'){
                                    if (!  this.currentGame[game].scores[report.teamWinner])
                                        this.currentGame[game].scores[report.teamWinner] = {}
                                    if (!  this.currentGame[game].scores[report.teamLose])
                                        this.currentGame[game].scores[report.teamLose] = {}

                                    if (! this.currentGame[game].scores[report.teamWinner][report.round])
                                        this.currentGame[game].scores[report.teamWinner][report.round] = []
                                    if (!  this.currentGame[game].scores[report.teamLose][report.round])
                                        this.currentGame[game].scores[report.teamLose][report.round] = []

                                    this.currentGame[game].scores[report.teamWinner][report.round].push(  this.currentGame[game].pairWinner)
                                    this.currentGame[game].scores[report.teamLose][report.round].push( this.currentGame[game].pairLose)

                                    if (! this.currentGame[game].scores[report.teamWinner].score)
                                        this.currentGame[game].scores[report.teamWinner].score = 0
                                    if (! this.currentGame[game].scores[report.teamWinner].score)
                                        this.currentGame[game].scores[report.teamLose].score = 0
                                    this.currentGame[game].scores[report.teamWinner].score +=   this.currentGame[game].pairWinner
                                    this.currentGame[game].scores[report.teamLose].score +=   this.currentGame[game].pairLose
                                }else if(report.status === 'none'){
                                    if (!  this.currentGame[game].scores[report.team1])
                                        this.currentGame[game].scores[report.team1] = {}
                                    if (!  this.currentGame[game].scores[report.team2])
                                        this.currentGame[game].scores[report.team2] = {}
                                    if (! this.currentGame[game].scores[report.team1][report.round])
                                        this.currentGame[game].scores[report.team1][report.round] = []
                                    if(!  this.currentGame[game].scores[report.team2][report.round])
                                        this.currentGame[game].scores[report.team2][report.round] = []

                                    this.currentGame[game].scores[report.team1][report.round].push( this.currentGame[game].pairNone)
                                    this.currentGame[game].scores[report.team2][report.round].push( this.currentGame[game].pairNone)

                                    if(!this.currentGame[game].scores[report.team1].score)
                                        this.currentGame[game].scores[report.team1].score = 0
                                    if(!this.currentGame[game].scores[report.team2].score)
                                        this.currentGame[game].scores[report.team2].score = 0

                                    this.currentGame[game].scores[report.team1].score +=  this.currentGame[game].pairNone
                                    this.currentGame[game].scores[report.team2].score +=  this.currentGame[game].pairNone
                                }else{
                                    if (!  this.currentGame[game].scores[report.team1])
                                        this.currentGame[game].scores[report.team1] = {}
                                    if (!  this.currentGame[game].scores[report.team2])
                                        this.currentGame[game].scores[report.team2] = {}
                                    if (! this.currentGame[game].scores[report.team1][report.round])
                                        this.currentGame[game].scores[report.team1][report.round] = []
                                    if(!  this.currentGame[game].scores[report.team2][report.round])
                                        this.currentGame[game].scores[report.team2][report.round] = []

                                    this.currentGame[game].scores[report.team1][report.round].push( this.currentGame[game].pairLose)
                                    this.currentGame[game].scores[report.team2][report.round].push( this.currentGame[game].pairLose)

                                    if(!this.currentGame[game].scores[report.team1].score)
                                        this.currentGame[game].scores[report.team1].score = 0
                                    if(!this.currentGame[game].scores[report.team2].score)
                                        this.currentGame[game].scores[report.team2].score = 0

                                    this.currentGame[game].scores[report.team1].score +=  this.currentGame[game].pairLose
                                    this.currentGame[game].scores[report.team2].score +=  this.currentGame[game].pairLose
                                }
                            }
                            else if (report.typeTask === 'alone'){
                                    if(!this.currentGame[game].scores[report.team])
                                        this.currentGame[game].scores[report.team] = {}
                                    if (! this.currentGame[game].scores[report.team][report.round])
                                        this.currentGame[game].scores[report.team][report.round] = []

                                    this.currentGame[game].scores[report.team][report.round].push(report.status === 'winner'? this.currentGame[game].aloneWinner: this.currentGame[game].aloneLose)
                                    if(!this.currentGame[game].scores[report.team].score)
                                        this.currentGame[game].scores[report.team].score = 0
                                    this.currentGame[game].scores[report.team].score +=  report.status === 'winner'? this.currentGame[game].aloneWinner: this.currentGame[game].aloneLose
                                }
                            this.sendInfoGame(ws, this.currentGame[game])
                            return this.sendCategoryInfoGame( this.currentGame[game].adminsSockets,  this.currentGame[game])
                        case 'chat':
                            this.currentGame[game].chat.push({user, message:messageData.message, date:Date.now()})
                            this.sendCategoryInfoGame( this.currentGame[game].adminsSockets,  this.currentGame[game])
                            this.sendCategoryInfoGame( this.currentGame[game].usersSockets,  this.currentGame[game])
                            break
                        case 'reset':
                            await this.restoreData()

                            const ga =messageData.gameId
                            this.currentGame[messageData.gameId] = {

                                adminsSockets: this.currentGame[messageData.gameId] && this.currentGame[messageData.gameId].adminsSockets?this.currentGame[messageData.gameId].adminsSockets:[],
                                usersSockets: this.currentGame[messageData.gameId] && this.currentGame[messageData.gameId].usersSockets?this.currentGame[messageData.gameId].usersSockets:[],
                                game: ga,
                                pairWinner :  ga.roundPairScoreWin,
                                pairLose : ga.roundPairScoreLose,
                                pairNone: ga.roundPairScoreNone,
                                aloneWinner: ga.roundAloneScoreWin,
                                aloneLose : ga.roundAloneScoreLose,
                                chat: [],
                                scores: {},
                                logs: []
                            }

                            this.sendCategoryInfoGame( this.currentGame[messageData.gameId].adminsSockets,  this.currentGame[messageData.gameId])
                            this.sendCategoryInfoGame( this.currentGame[messageData.gameId].usersSockets,  this.currentGame[messageData.gameId])
                            break
                        default:
                            ws.send(JSON.stringify({warning:true, message:'Неизвестный запрос'}))
                    }
                })
                ws.on('close', ()=> {
                    if (game)
                        if (user.role === 'admin')
                            this.currentGame[game].adminsSockets = this.currentGame[game].adminsSockets.filter(u=>u.user.id!==user.id)
                        else
                            this.currentGame[game].usersSockets = this.currentGame[game].usersSockets.filter(u=>u.user.id!==user.id)
                })
            })
        }catch (e){
            console.log(e)
        }
    }

    async restoreData(){

        const resultGames = await GameService.getGames()
        if (!resultGames.warning)
            this.gamesStore = resultGames.data.games

        const resultLocation = await LocationService.getLocations()
        if(!resultLocation.warning)
            this.locationsStore = resultLocation.data.locations

        const resultUsers = await UserService.getAllUsers()

        if(!resultUsers.warning)
            this.usersStore = resultUsers.data.users

       await this.confirmData()
    }

    async confirmData(){
        this.gamesStore.forEach(game=>{

            this.games[game.id] = {...game}
            this.usersStore.forEach(async (user)=>{
                if (user.role === 'user'){
                    const map = await this.getMapByUserIdAndGameId(game, user.id)
                    if (map.length>0){
                        if(!this.users[user.id])
                            this.users[user.id] = {}
                        // if( !this.users[user.id][game.id])
                        //     this.users[user.id][game.id] = []
                        this.users[user.id][game.id] = map
                    }

                }
            })
            const locations = []
            for(let loc of game.locations){
                const location = this.locationsStore.find(l=>l.id === loc)
                if (location) {
                    location.user = this.usersStore.find(u => u.id === location.user)
                }
                locations.push(location)
            }
            this.games[game.id].locations = locations
        })
    }

    async getMapByUserIdAndGameId(game, userId){
        const mapList = []
        let isAlone = true
        try {
            if (!game['map'])
                return mapList
            for (let i of game['map']) {
                let count = 0
                for (let loc of i[1]) {
                    for (let idLoc of loc) {
                        if (loc !== 'none') {
                            const location = this.locationsStore.find(l => l.id === idLoc)
                            if (isAlone && location && location.type === 'alone')
                                isAlone = false
                            if (location && location.user && location.user === userId)
                                mapList.push({round: count, team: i[0], location})
                        }
                    }
                    count++
                }
            }
            if (mapList.length === 0)
                return []
            // console.log(mapList)
            mapList.sort((a, b) => a.round - b.round)
            const add = isAlone?2:4
            if (mapList[0].location.type === 'double') {
                const newMapList = []
                for (let i = 0; i < mapList.length; i = i + add) {
                    if ((!isAlone && mapList[i] && mapList[i+1] && mapList[i].round === mapList[i + 1].round)||(isAlone  && mapList[i] && mapList[i+1] )) {
                        newMapList.push({
                            round: mapList[i].round,
                            team1: mapList[i].team,
                            team2: mapList[i + 1].team,
                            location: mapList[i].location,
                            isAlone:isAlone

                        })
                    } else {
                        newMapList.push(mapList[i])
                        newMapList.push(mapList[i + 1])
                    }
                }
                return newMapList
            }
            return mapList
        }catch (e) {
            console.log(e)
            return []
        }

    }

    sendCategoryInfoGame(categorySockets, game){
        const message = {...game}
        message.adminsSockets = game.adminsSockets.length
        message.usersSockets = game.usersSockets.length

        for(let i of categorySockets){
           i.ws.send(JSON.stringify({action:'infoGame', gameInfo:message}))
        }
    }

    sendInfoGame(ws, game){
        const message = {...game}
        message.adminsSockets = game.adminsSockets.length
        message.usersSockets = game.usersSockets.length

        ws.send(JSON.stringify({action:'infoGame', gameInfo:message}))
    }

}

module.exports = new GameSocket()