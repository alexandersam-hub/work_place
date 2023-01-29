class UserDto{

    id
    username
    password
    role
    stringName
    isActive
    description


    constructor(model) {
        this.id = model.id?model.id.toString():''
        this.username = model.username;
        this.password = model.password;
        this.stringName = model.stringName
        this.role = model.role;
        this.isActive = model.isActive;
        this.description = model.description?model.description:''
    }

}

module.exports = UserDto