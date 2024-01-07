class ApiResponse{
    constructor(statuCode,data,message = "Success"){
        this.message = message,
        this.statuCode = statuCode ,
        this.success = statuCode < 400,
        this.data = data
    }
}


export { ApiResponse }