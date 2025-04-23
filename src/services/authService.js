const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Trainer = require('../models/Trainer');
const trainerService = require('./trainerService');

const dotenv = require('dotenv');
dotenv.config();


class AuthService {

    async register(trainerData) {
        try {
            const trainer = await Trainer.create(trainerData);
            const tokens = this.generateTokens({ id: trainer.id });
            
            // Stocker le refresh token
            await trainer.update({ refreshToken: tokens.refreshToken });

            return { trainer : trainer, tokens : tokens };

        } catch (error) {
            throw error;
        }
    }

    
    async login(email, password) {

        const trainer = await trainerService.getTrainerByEmail(email);
        if (!trainer) {
            return false
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, trainer.password);
        if (!isPasswordValid) {
            return false
        }

            const tokens = this.generateTokens(trainer);
            
            // Stocker le nouveau refresh token
            await trainer.update({ refreshToken: tokens.refreshToken });

            return { trainer, ...tokens};
        
    }
    


    generateTokens(trainer) {
        const accessToken = jwt.sign(
            { id: trainer.id },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '1m' }
        );

        const refreshToken = jwt.sign(
            { id: trainer.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '15d' }
        );

        return { accessToken, refreshToken };
    }

    
    
    async refreshToken(refreshToken) {
        try {
            // Vérifier si le token est valide
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            
            // Trouver le trainer et vérifier si le refresh token correspond
            const trainer = await Trainer.findOne({
                where: {
                    id: decoded.id,
                    refreshToken: refreshToken
                }
            });
            
            if (!trainer) {
                return false;
            }

            // Générer de nouveaux tokens
            const tokens = this.generateTokens(trainer);
            
            // Mettre à jour le refresh token
            await trainer.update({ refreshToken: tokens.refreshToken });

            return tokens;
        } catch (error) {
            throw new Error('Token invalide');
        }
    }

    async logout(trainerId) {
        try {
            const trainer = await Trainer.findByPk(trainerId);
            if (trainer) {
                // Révoquer le refresh token en le mettant à null
                await trainer.update({ refreshToken: null });
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AuthService(); 