import { Router } from 'express';
import { createLeague, getLeagues, deleteLeague } from '../controllers/leagueController';

const router = Router();

router.post('/', createLeague);
router.get('/', getLeagues);
router.delete('/:id', deleteLeague);

export default router;