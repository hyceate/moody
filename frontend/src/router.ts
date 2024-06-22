// Generouted, changes to this file will be overriden
/* eslint-disable */

import { components, hooks, utils } from "@generouted/react-router/client";

export type Path =
  | `/`
  | `/:username/:url`
  | `/pin/:id`
  | `/profile/:username`
  | `/profile/:username/created`
  | `/profile/:username/pins`
  | `/profile/:username/saved`
  | `/settings`
  | `/upload`;

export type Params = {
  "/:username/:url": { username: string; url: string };
  "/pin/:id": { id: string };
  "/profile/:username": { username: string };
  "/profile/:username/created": { username: string };
  "/profile/:username/pins": { username: string };
  "/profile/:username/saved": { username: string };
};

export type ModalPath = never;

export const { Link, Navigate } = components<Path, Params>();
export const { useModals, useNavigate, useParams } = hooks<
  Path,
  Params,
  ModalPath
>();
export const { redirect } = utils<Path, Params>();
