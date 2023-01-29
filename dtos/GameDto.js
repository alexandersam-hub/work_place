class GameDto{

    id
    name
    description
    locations
    isActive
    countTeams
    countRound
    map
    roundPairScoreWin
    roundPairScoreLose
    roundPairScoreNone
    roundAloneScoreWin
    roundAloneScoreLose


    constructor(model) {
        this.id = model.id?model.id.toString():''
        this.name = model.name;
        this.description = model.description
        this.locations = model.locations;
        this.isActive = model.isActive;
        this.countTeams = model.countTeams
        this.countRound = model.countRound
        this.map = model.map
        this.roundPairScoreWin = model.roundPairScoreWin?model.roundPairScoreWin:0
        this.roundPairScoreLose = model.roundPairScoreLose?model.roundPairScoreLose:0
        this.roundPairScoreNone = model.roundPairScoreNone?model.roundPairScoreNone:0
        this.roundAloneScoreWin = model.roundAloneScoreWin?model.roundAloneScoreWin:0
        this.roundAloneScoreLose = model.roundAloneScoreLose?model.roundAloneScoreLose:0
    }

}

module.exports = GameDto