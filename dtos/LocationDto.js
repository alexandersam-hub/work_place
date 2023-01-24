class LocationDto{

    id
    name
    description
    user
    type
    isActive

    constructor(model) {
        this.id = model.id?model.id.toString():''
        this.name = model.name;
        this.Description = model.Description
        this.location = model.location;
        this.user = model.user;
        this.type = model.type;
        this.isActive = model.isActive;
    }
}

module.exports = LocationDto