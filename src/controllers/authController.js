const authService = require('../services/authService');
const trainerService = require('../services/trainerService');
const validator = require('validator');
const bcrypt = require('bcryptjs');

class AuthController {



    async register(req, res) {

        try {
            const { firstName, email, password } = req.body;
            
            //Vérifications
            if (!firstName || !email || !password) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }   
            if (!validator.isLength(firstName, { min: 3, max: 20 })) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
            if (!validator.isEmail(email)) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
            if (!validator.isLength(password, { min: 8, max: 30 })) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
        
            const existingTrainer = await trainerService.getTrainerByEmail(email);
            if (existingTrainer) {
                return res.status(409).json({ statusCode: 409, message: "Conflict" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await authService.register({ firstName, lastName : "", email, password: hashedPassword });
 

            return res.status(201).json({
                trainer: result.trainer,
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken
                
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ statusCode: 500, message:  "Internal Server Error" });
        }
    }



    async login(req, res) {

        try {
            const { email, password } = req.body;

            //Vérifications
            if (!email || !password) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
            if (!validator.isEmail(email)) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
            if (!validator.isLength(password, { min: 8, max: 30 })) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }

 
            const result = await authService.login(email, password);
            if (!result) {
                return res.status(401).json({ statusCode: 401, message: "Unauthorized" });
            }
            

            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(401).json({ statusCode: 500, message: "Internal Server Error" });
        }
    }

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            //Vérifications
            if (!refreshToken || !validator.isJWT(refreshToken)) {
                return res.status(400).json({ statusCode: 400, message: "Bad Request" });
            }
            const tokens = await authService.refreshToken(refreshToken);
            if (!tokens) {
                return res.status(401).json({ statusCode: 401, message: "Unauthorized" });
            }

            return res.status(200).json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });

        } catch (error) {
            return res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
        }
    }


    async logout(req, res) {
        try {
            const trainerId = req.trainer.id;
            await authService.logout(trainerId);
            
            return res.status(200).json({ statusCode: 200, message: "OK" });
        } catch (error) {
            return res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
        }
    }
}

module.exports = new AuthController(); 