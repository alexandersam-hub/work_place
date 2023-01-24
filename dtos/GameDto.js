class GameDto{

    id
    name
    description
    locations
    isActive
    countTeams
    countRound
    map

    constructor(model) {
        this.id = model.id?model.id.toString():''
        this.name = model.name;
        this.description = model.description
        this.locations = model.locations;
        this.isActive = model.isActive;
        this.countTeams = model.countTeams
        this.countRound = model.countRound
        this.map = model.map
    }

}

module.exports = GameDto