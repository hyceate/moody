// Generouted, changes to this file will be overriden
/* eslint-disable */

import { components, hooks, utils } from "@generouted/react-router/client";

export type Path =
  | `/`
  | `/:username/:title`
  | `/explore`
  | `/pin/:id`
  | `/profile/:username`
  | `/settings`
  | `/upload`;

export type Params = {
  "/:username/:title": { username: string; title: string };
  "/pin/:id": { id: string };
  "/profile/:username": { username: string };
};

export type ModalPath = never;

export const { Link, Navigate } = components<Path, Params>();
export const { useModals, useNavigate, useParams } = hooks<
  Path,
  Params,
  ModalPath
>();
export const { redirect } = utils<Path, Params>();
