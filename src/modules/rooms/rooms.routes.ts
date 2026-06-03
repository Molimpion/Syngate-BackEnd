import { Router } from "express";
import { RoomsController } from "./rooms.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import { roleMiddleware } from "../../shared/middlewares/role.middleware";
import { validate } from "../../shared/middlewares/validate.middlewares";
import { createRoomSchema, updateRoomSchema } from "../../schemas/room.schema";
import { PapelUsuario } from "@prisma/client";

const router = Router();
const roomsController = new RoomsController();

router.use(authMiddleware);

router.get("/", roomsController.findAll);
router.get("/:id", roomsController.findById);

const adminRoles = [PapelUsuario.GESTOR, PapelUsuario.COORDENADOR];

router.post(
  "/",
  roleMiddleware(adminRoles),
  validate(createRoomSchema),
  roomsController.create,
);
router.put(
  "/:id",
  roleMiddleware(adminRoles),
  validate(updateRoomSchema),
  roomsController.update,
);
router.delete("/:id", roleMiddleware(adminRoles), roomsController.delete);

export { router as roomsRouter };
