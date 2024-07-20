import { Router } from 'express';
import { createTeam, getTeams, getTeamById, updateTeam, deleteTeam } from '../controllers/teamController';
import { body, param, query } from 'express-validator';
import validateRequest from '../middleware/validateRequest';

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
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Team name is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('leagueId').isInt().withMessage('League ID must be an integer')
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
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by country
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
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Invalid team ID'),
    query('country').optional().isString().withMessage('Country must be a string')
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
 *       200:
 *         description: The team was updated successfully
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
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Invalid team ID'),
    body('name').notEmpty().withMessage('Team name is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('leagueId').isInt().withMessage('League ID must be an integer')
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
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.delete(
  '/:id',
  [
    param('id').isInt().withMessage('Invalid team ID')
  ],
  validateRequest,
  deleteTeam
);

export default router;