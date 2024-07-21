import { Router } from 'express';
import { body, param } from 'express-validator';
import { createLeague, getLeagues, deleteLeague } from '../controllers/leagueController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

/**
 * @swagger
 * /leagues:
 *   post:
 *     summary: Create a new league
 *     tags: [Leagues]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Premier League
 *     responses:
 *       201:
 *         description: The league was created successfully
 *       400:
 *         description: Invalid league name
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
  ],
  validateRequest,
  createLeague
);

/**
 * @swagger
 * /leagues:
 *   get:
 *     summary: Get all leagues
 *     tags: [Leagues]
 *     responses:
 *       200:
 *         description: A list of leagues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Premier League
 *       500:
 *         description: Server error
 */
router.get('/', getLeagues);

/**
 * @swagger
 * /leagues/{id}:
 *   delete:
 *     summary: Delete a league by ID
 *     tags: [Leagues]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The league ID
 *     responses:
 *       200:
 *         description: The league was deleted successfully
 *       404:
 *         description: The league was not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/:id',
  [
    param('id').isInt().withMessage('ID must be an integer'),
  ],
  validateRequest,
  deleteLeague
);

export default router;