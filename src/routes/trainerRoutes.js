const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const authMiddleware = require('../middleware/authMiddleware');


/**
 * @swagger
 * /api/v1/trainers:
 *   get:
 *     summary: Récupère la liste complète de tous les trainers
 *     description: Cette route retourne tous les trainers enregistrés dans le système
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des trainers récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trainers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trainer'
 *       401:
 *         description: Non autorisé - Token JWT invalide ou manquant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 */
router.get('/', authMiddleware, trainerController.getAllTrainers);

/**
 * @swagger
 * /api/v1/trainers/me:
 *   get:
 *     summary: Récupère les informations du trainer connecté
 *     description: Retourne les informations du trainer actuellement authentifié
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations du trainer récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trainer'
 *       401:
 *         description: Non autorisé - Token JWT invalide ou manquant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 */
router.get('/me', authMiddleware, trainerController.getMe);

/**
 * @swagger
 * /api/v1/trainers:
 *   patch:
 *     summary: Met à jour les informations du trainer connecté
 *     description: Permet de modifier les informations du trainer actuellement authentifié
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Nouveau prénom du trainer
 *               lastName:
 *                 type: string
 *                 description: Nouveau nom de famille du trainer
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Nouvelle adresse email du trainer
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Nouveau mot de passe du trainer
 *     responses:
 *       200:
 *         description: Informations du trainer mises à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trainer'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé - Token JWT invalide ou manquant
 *       409:
 *         description: Email déjà utilisé
 */
router.patch('/', authMiddleware, trainerController.updateTrainer);

/**
 * @swagger
 * /api/v1/trainers:
 *   delete:
 *     summary: Supprime le compte du trainer connecté
 *     description: Cette route supprime définitivement le compte du trainer actuellement authentifié
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compte supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Compte supprimé avec succès
 *       401:
 *         description: Non autorisé - Token JWT invalide ou manquant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 */
router.delete('/', authMiddleware, trainerController.deleteTrainer);

/**
 * @swagger
 * /api/v1/trainers/team/pokemon:
 *   post:
 *     summary: Ajoute un Pokémon à l'équipe du trainer
 *     description: Ajoute un nouveau Pokémon à l'équipe du trainer connecté
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pokemonId
 *             properties:
 *               pokemonId:
 *                 type: number
 *                 description: ID du Pokémon
 *     responses:
 *       200:
 *         description: Pokémon ajouté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pokémon ajouté avec succès
 *       400:
 *         description: Équipe complète (6 Pokémon maximum) ou données invalides
 *       401:
 *         description: Non autorisé - Token JWT invalide ou manquant
 */
router.post('/team/pokemon', authMiddleware, trainerController.addPokemonToTeam);

/**
 * @swagger
 * /api/v1/trainers/team/pokemon/{pokemonId}:
 *   delete:
 *     summary: Retire un Pokémon de l'équipe du trainer
 *     description: Retire un Pokémon de l'équipe du trainer connecté
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pokemonId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID du Pokémon à retirer
 *     responses:
 *       200:
 *         description: Pokémon retiré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pokémon retiré avec succès
 *       401:
 *         description: Non autorisé - Token JWT invalide ou manquant
 *       404:
 *         description: Pokémon non trouvé dans l'équipe
 */
router.delete('/team/pokemon/:pokemonId', authMiddleware, trainerController.removePokemonFromTeam);



module.exports = router; 