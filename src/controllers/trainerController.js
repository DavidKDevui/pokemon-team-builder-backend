const trainerService = require('../services/trainerService');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { v4: uuidv4 } = require('uuid');

class TrainerController {


    async getAllTrainers(req, res) {
        try {
            const trainers = await trainerService.getAllTrainers();
            res.status(200).json({ trainers : trainers });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ statusCode: 500, message:  "Internal Server Error" });
        }
    }

    async getTrainerById(req, res) {

        try {
            const { id }  = req.trainer;

            //Vérifications
            if (!validator.isUUID(id)) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
            const trainer = await trainerService.getTrainerById(id);
            if (!trainer) {
                return res.status(404).json({ statusCode: 404, message: "Not Found" });
            }

            return res.status(200).json(trainer);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ statusCode: 500, message:  "Internal Server Error" });
        }
    }


    async getMe(req, res) {
        try {
            const { id } = req.trainer;
            const trainer = await trainerService.getTrainerById(id);
            return res.status(200).json(trainer);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ statusCode: 500, message:  "Internal Server Error" });
        }
    }
 

    async updateTrainer(req, res) {

        try {
            const { id }  = req.trainer;
            const { firstName, lastName, email, password } = req.body;


            //Vérifications
            if (!validator.isUUID(id)) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }

            if (!firstName && !lastName && !email && !password) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
            if (firstName && !validator.isLength(firstName, { min: 3, max: 20 })) {
                console.log("Invalid First Name");
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
            if (lastName && !validator.isLength(lastName, { min: 3, max: 20 })) {
                console.log("Invalid Last Name");
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
            if (email && !validator.isEmail(email)) {
                console.log("Invalid Email");
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
            if (password && !validator.isLength(password, { min: 8, max: 30 })) {
                console.log("Invalid Password");
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }

       
            const existingTrainer = await trainerService.getTrainerById(id);
            if (!existingTrainer) {
                return res.status(404).json({ statusCode: 404, message: "Not Found" });
            }

            let finalPassword;
            if (password) {
                finalPassword = await bcrypt.hash(password, 10);
            } else {
                finalPassword = existingTrainer.password;
            }

            if (email) {
                const existingTrainerWithEmail = await trainerService.getTrainerByEmail(email);
                if (existingTrainerWithEmail && existingTrainerWithEmail.id !== id) {
                    return res.status(409).json({ statusCode: 409, message: "Conflict" });
                }
            }

            const trainerData = {};
            if (firstName) trainerData.firstName = firstName;
            if (lastName) trainerData.lastName = lastName;
            if (email) trainerData.email = email;
            if (password) trainerData.password = finalPassword;

            const trainer = await trainerService.updateTrainer(id, trainerData);

            return res.status(200).json({ trainer: trainer });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ statusCode: 500, message:  "Internal Server Error" });
        }
    }   



    async deleteTrainer(req, res) {

        try {   
            const { id }  = req.trainer;

            //Vérifications
            if (!validator.isUUID(id)) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }

        
            const existingTrainer = await trainerService.getTrainerById(id);
            if (!existingTrainer) {
                return res.status(404).json({ statusCode: 404, message: "Not Found" });
            }
            await trainerService.deleteTrainer(id);
            return res.status(204).json({ statusCode: 204, message: "No Content" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
        }
    }

  
    async addPokemonToTeam(req, res) {

        try {
            const { id }  = req.trainer;
            const { pokemonId } = req.body;

            const pokemonIdString = pokemonId.toString();

            //Vérifications
            if (!validator.isUUID(id)) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
            if (!validator.isInt(pokemonIdString)) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }

       
            const existingTrainer = await trainerService.getTrainerById(id);
            if (!existingTrainer) {
                return res.status(404).json({ statusCode: 404, message: "Not Found" });
            }
            
            const team = existingTrainer.team;
            if (team.length >= 6) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
            if (team.includes(pokemonIdString)) {
                return res.status(409).json({ statusCode: 409, message: "Conflict" });
            }

            team.push(pokemonIdString);   
            await trainerService.updateTrainer(id, { team });
 
            return res.status(200).json({ team : team });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
        }

    }   


    async removePokemonFromTeam(req, res) {

        try {
            const { id } = req.trainer;
            const { pokemonId } = req.params;

            const pokemonIdString = pokemonId.toString();

            //Vérifications
            if (!validator.isUUID(id)) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
            if (!validator.isInt(pokemonIdString)) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }

            const existingTrainer = await trainerService.getTrainerById(id);    
            if (!existingTrainer) {
                return res.status(404).json({ statusCode: 404, message: "Not Found" });
            }

            const team = existingTrainer.team;
            const index = team.indexOf(pokemonIdString);
            if (index === -1) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
            team.splice(index, 1);
            await trainerService.updateTrainer(id, { team });
 
            return res.status(200).json({ team : team });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
        }
        
    }   
    
    
}




module.exports = new TrainerController(); 