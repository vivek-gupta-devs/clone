class ApiResponse{
    constructor(message = "Success",statuCode,success, data ){
        this.message = message,
        this.statuCode = statuCode < 400,
        this.success = success,
        thsi.data = data
    }
}


export { ApiResponse }