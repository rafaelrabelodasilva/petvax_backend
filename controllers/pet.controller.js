const petModel = require('../models/pet.model')
const userModel = require('../models/user.model')

const auth = async (userId) => {

    const foundUser = await userModel.findById(userId) //findById função do mongoose para buscar o usuário pelo ID

    if(!foundUser)
        throw {error: 'Unauthorized', code:401}
}

module.exports = {
    async create(request, h) { //cria um contato

        const userId = request.headers.authorization //Obtém o usuário do header

        try {
            await auth(userId)
        } catch (error) {
            return h.response(error).code(error.code)
        }

        if (request.payload === null) //Questiona se o payload é nulo
            return h.response({message:'Not json'}).code(400)

        // console.log(request.payload) //Pega o valor da requisição e exibe no console

        // Guardado essa instancia (new petModel) em uma constante
        const pet = new petModel({ //Feito uma nova instancia para petModel 
            petName: request.payload.petName,
            petSpecies: request.payload.petSpecies,
            petGender: request.payload.petGender,
            petBirth: request.payload.petBirth,
            petBreed: request.payload.petBreed,
            petAdStreet: request.payload.petAdStreet,
            petAdNeighborhood: request.payload.petAdNeighborhood,
            petAdNumber: request.payload.petAdNumber,
            petAdInfo: request.payload.petAdInfo,
            petAdCep: request.payload.petAdCep,
            petAdCity: request.payload.petAdCity,
            petAdState: request.payload.petAdState,
            petResFirstName: request.payload.petResFirstName,
            petRespLastName: request.payload.petRespLastName,
            petRespContact1: request.payload.petRespContact1,
            petRespContact2: request.payload.petRespContact2,
            userId: userId
        })

        // console.log(!contact.name) //O operador ! questiona se o objeto contact.name é undefined e exibe no console

        if (!pet.petName) //Verifica se o objeto contact.name é undefined 
            return h.response({message:'Name is required.'}).code(409) //Se cair dentro desse if irá devolver o status code 409. Se cair nesse if o código é finalizado

        if (!pet.petRespContact1)
            return h.response({message:'Number is required.'}).code(409)//Além de retornar o statuscode ele também devolve uma mensagem que é verificada no teste `post.test.js`

        const dup = await petModel.findOne({petName: pet.petName, userId: userId}).exec(); //Essa função busca um registro no banco

        if (dup)
        return h.response({error: 'Duplicated pet.'}).code(409) //Retorna mensagem se o numero de telefone que está tentando cadastrar é o mesmo de um já existente
        try {
            let result = await pet.save() //Chamado o objeto contact e invocado a função salvar. Desta forma será salvo as informações no banco de dados através do Mongoose
            return h.response(result).code(200); //Na `response` estamos enviando o resultado esperado. Chamado a função `code()` colocando o status 200
        } catch (error) {
            return h.response(error).code(500)
        }
    },
    async remove(request, h) {

        const userId = request.headers.authorization //Obtém o usuário do header

        try {
            await auth(userId)
        } catch (error) {
            return h.response(error).code(error.code)
        }

        try {

            const user = await petModel.findOne({ _id: request.params.petId, userId: userId}) //Irá buscar um contato com o contato ID passado no parâmetro que no caso é o ID do contato que será deletado do banco

            if(!user)
                return h.response({error: 'There is no pet with that id.'}).code(404) //Se não encontrar um registro com o contatoId e UserId informado no header será exibido 404

            await petModel.deleteOne({ _id: request.params.petId, userId: userId}) //O campo precisa ser `_id` porque é a coluna do banco.
            return h.response({}).code(204) //Código 204 (no content)
        } catch (error) {
            return h.response(error).code(500) //Se algum erro ocorrer será visualizado
        }
    },
    
    async list(request, h) {

        const userId = request.headers.authorization //Obtém o usuário do header

        try {
            await auth(userId)
        } catch (error) {
            return h.response(error).code(error.code)
        }

        const pets = await petModel.find({userId: userId}).exec(); //Busca as modelagens no banco de dados
        return pets;
    }
}

// async para ser assíncrona e ter uma promessa
// await entrega a promessa
// request é a requisição
// h é o retorno e pode ser manipulado como fizemos na constante contact (status code)
// Todos os métodos do mongoose trabalham com promessa. Então nossas funções `create(request, h)` precisam do async

// Adicionado autenticação e o cadastro de contatos só funcionará se o usuário tiver autorização o qual é passado no ID do headers que é o próprio token do usuário cadastrado no sistema
// Adicionado sistema de autenticação também dentro da função remove() para que seja deletado o contato apenas do usuário logado
// Adicionado sistema de autenticação para a função list() que só irá exibir os contatos relacionados ao ID do header