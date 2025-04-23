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
                return res.status(400).json({ status: 400, message: "Bad Request" });
            }   
            if (!validator.isLength(firstName, { min: 3, max: 20 })) {
                return res.status(400).json({ status: 400, message: "Bad Request" });
            }
            if (!validator.isEmail(email)) {
                return res.status(400).json({ status: 400, message: "Bad Request" });
            }
            if (!validator.isLength(password, { min: 8, max: 30 })) {
                return res.status(400).json({ status: 400, message: "Bad Request" });
            }
        
            const existingTrainer = await trainerService.getTrainerByEmail(email);
            if (existingTrainer) {
                return res.status(409).json({ status: 409, message: "Conflict" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await authService.register({ firstName, lastName : "", email, password: hashedPassword });
 

            return res.status(201).json({
                status : 201,
                message : "Created",
                trainer: result.trainer,
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken
                
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message:  "Internal Server Error" });
        }
    }



    async login(req, res) {

        try {
            const { email, password } = req.body;

            //Vérifications
            if (!email || !password) {
                return res.status(400).json({ status: 400, message: "Bad Request" });
            }
            if (!validator.isEmail(email)) {
                return res.status(400).json({ status: 400, message: "Bad Request" });
            }
            if (!validator.isLength(password, { min: 8, max: 30 })) {
                return res.status(400).json({ status: 400, message: "Bad Request" });
            }

 
            const result = await authService.login(email, password);
            if (!result) {
                return res.status(401).json({ status: 401, message: "Unauthorized" });
            }
            

            return res.status(200).json({...result, status : 200 });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: "Internal Server Error" });
        }
    }

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            //Vérifications
            if (!refreshToken || !validator.isJWT(refreshToken)) {
                return res.status(400).json({ status: 400, message: "Bad Request" });
            }
            const tokens = await authService.refreshToken(refreshToken);
            if (!tokens) {
                return res.status(401).json({ status: 401, message: "Unauthorized" });
            }

            return res.status(200).json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, status : 200 });

        } catch (error) {
            return res.status(500).json({ status: 500, message: "Internal Server Error" });
        }
    }


    async logout(req, res) {
        try {
            const trainerId = req.trainer.id;
            await authService.logout(trainerId);
            
            return res.status(200).json({ status: 200, message: "OK" });
        } catch (error) {
            return res.status(500).json({ status: 500, message: "Internal Server Error" });
        }
    }
}

module.exports = new AuthController(); 