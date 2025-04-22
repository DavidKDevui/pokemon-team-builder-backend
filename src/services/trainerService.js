const Trainer = require('../models/Trainer');


class TrainerService {

    async getAllTrainers() {
        try {
            const trainers = await Trainer.findAll({ attributes: { exclude: ['password', 'refreshToken'] } });
            return trainers;
        } catch (error) {
            throw new Error('Erreur lors de la récupération des trainers: ' + error.message);
        }
    }

    async getTrainerById(id) {
        try {
            const trainer = await Trainer.findByPk(id, { attributes: { exclude: ['password', 'refreshToken'] } });
            return trainer;
        } catch (error) {
            throw new Error('Erreur lors de la récupération du trainer: ' + error.message);
        }
    }

    async getTrainerByEmail(email) {
        try {
            const trainer = await Trainer.findOne({ where: { email } });
            return trainer;
        } catch (error) {
            throw new Error('Erreur lors de la récupération du trainer: ' + error.message);
        }
    }

    async createTrainer(trainerData) {
        try {
            const trainer = await Trainer.create(trainerData);
            const trainerWithoutPassword = { ...trainer.toJSON(), password: undefined };
            return trainerWithoutPassword;
        } catch (error) {
            throw new Error('Erreur lors de la création du trainer: ' + error.message);
        }
    }

    async updateTrainer(id, trainerData) {
        try {
            const trainer = await Trainer.findByPk(id); 
            await trainer.update(trainerData);
            const trainerWithoutPassword = { ...trainer.toJSON(), password: undefined };
            return trainerWithoutPassword;
        } catch (error) {
            throw new Error('Erreur lors de la mise à jour du trainer: ' + error.message);
        }
    }

    async deleteTrainer(id) {
        try {
            const trainer = await Trainer.findByPk(id);
            await trainer.destroy();
        } catch (error) {
            throw new Error('Erreur lors de la suppression du trainer: ' + error.message);
        }
    }

}

module.exports = new TrainerService(); 