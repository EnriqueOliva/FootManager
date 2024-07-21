import { Router } from 'express';
import { body, param } from 'express-validator';
import { createTeam, getTeams, getTeamById, updateTeam, deleteTeam } from '../controllers/teamController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - country
 *               - leagueId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Manchester United
 *               country:
 *                 type: string
 *                 example: England
 *               leagueId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: The team was created successfully
 *       400:
 *         description: Invalid team
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('leagueId').isInt().withMessage('League ID must be an integer'),
  ],
  validateRequest,
  createTeam
);

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Get all teams
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: A list of teams
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
 *                     example: Manchester United
 *                   country:
 *                     type: string
 *                     example: England
 *                   leagueId:
 *                     type: integer
 *                     example: 1
 *       500:
 *         description: Server error
 */
router.get('/', getTeams);

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get a team by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team ID
 *     responses:
 *       200:
 *         description: The team information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Manchester United
 *                 country:
 *                   type: string
 *                   example: England
 *                 leagueId:
 *                   type: integer
 *                   example: 1
 *       404:
 *         description: The team was not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('ID must be an integer'),
  ],
  validateRequest,
  getTeamById
);

/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     summary: Update a team by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Manchester United
 *               country:
 *                 type: string
 *                 example: England
 *               leagueId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: The team was updated successfully
 *       404:
 *         description: The team was not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('country').optional().notEmpty().withMessage('Country cannot be empty'),
    body('leagueId').optional().isInt().withMessage('League ID must be an integer'),
  ],
  validateRequest,
  updateTeam
);

/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Delete a team by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team ID
 *     responses:
 *       200:
 *         description: The team was deleted successfully
 *       404:
 *         description: The team was not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/:id',
  [
    param('id').isInt().withMessage('ID must be an integer'),
  ],
  validateRequest,
  deleteTeam
);

export default router;