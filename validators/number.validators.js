import chalk from "chalk";

export function lowerFirstFive(str) {
    return str.slice(0, 5).toLowerCase() + str.slice(5)
}


export async function number_validator(code) {
    if(code == null){
        return true
    }
    
    const num = Number(code)

    if (Number.isNaN(num) || !Number.isInteger(num)) {
        console.log(chalk.red("Number not valid!"))
        return false
    }

    return true
}

export function null_validator(nul){
    if(nul == 'null'){
        return true
    }else{
        console.log(chalk.red("Invalid Value!"))
        return false
    }
}


export function main_operation_validator(data){
    const Data = Number(data)
    if(Data < 1 || Data > 4 || !Number.isInteger(Data)){
        console.log(chalk.red('Operation number not valid!'))
        return false
    }else{
        return true
    }
}



export function database_id_validator(data){
    const Data = Number(data)
    if(Data < 1 || Data > 2 || !Number.isInteger(Data)){
        console.log(chalk.red('Database number not valid!'))
        return false
    }else{
        return true
    }
}


export function is_success_Validator(is_success) {
    let num = Number(is_success)
    if(num >= 0 && num < 2 && Number.isInteger(num)){
        return true
    }else{
        console.log(chalk.red("is_Success out of range"))
    }
}