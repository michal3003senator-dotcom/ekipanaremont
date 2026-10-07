import type { Access, CollectionConfig, Field, Where } from 'payload'

import {
  all,
  either,
  fieldFor,
  isFirmUser,
  moderation,
  nobody,
  ownAccount,
  verifiedModeration,
  where,
} from '@/access'
import { community } from '@/access/community'
import { assignAuthor } from '@/hooks/assignOwner'

import { options, slugField, systemOnly, uniqueSlug } from './fields'

const member = community('forum')
const moderationOnly = {
  create: fieldFor(verifiedModeration),
  update: fieldFor(verifiedModeration),
}
const EDIT_WINDOW_MS = 15 * 60 * 1000

const visibility = options({
  pending: 'Czeka na moderację',
  visible: 'Widoczny',
  hidden: 'Ukryty',
  deleted: 'Usunięty przez autora',
})

/** Wpisy zalogowanej firmy (autor jest polimorficzny: firma albo personel). */
const ownEntry: Access = ({ req: { user } }) => {
  if (!user || !isFirmUser(user)) return false
  const own: Where = {
    and: [
      { 'author.relationTo': { equals: 'firmAccounts' } },
      { 'author.value': { equals: user.id } },
    ],
  }
  return own
}

/** Widoczne wpisy plus własne (także czekające na moderację). */
const visibleOrOwn = all(member, either(where({ status: { equals: 'visible' } }), ownEntry))

const author: Field = {
  name: 'author',
  type: 'relationship',
  relationTo: ['firmAccounts', 'staff'],
  label: 'Autor',
  required: true,
  access: systemOnly,
}

/** Kategorie forum (SPEC 3.9), zarządzane przez moderację. */
export const ForumCategories: CollectionConfig = {
  slug: 'forumCategories',
  labels: { singular: 'Kategoria forum', plural: 'Kategorie forum' },
  admin: { defaultColumns: ['name', 'order'], useAsTitle: 'name', group: 'Forum' },
  access: {
    read: either(moderation, member),
    create: moderation,
    update: moderation,
    delete: moderation,
  },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', label: 'Nazwa', required: true },
    slugField('name'),
    { name: 'description', type: 'textarea', label: 'Opis' },
    { name: 'order', type: 'number', label: 'Kolejność', defaultValue: 0 },
  ],
}

/**
 * Wątek (SPEC 3.9). Nowe wpisy czekają na moderację, dopóki faza forum nie wprowadzi reguł
 * automatycznej akceptacji (pierwsze 3 posty, słowa wstrzymujące, limity).
 */
export const ForumThreads: CollectionConfig = {
  slug: 'forumThreads',
  labels: { singular: 'Wątek', plural: 'Wątki' },
  admin: {
    defaultColumns: ['title', 'category', 'status', 'lastActivityAt'],
    useAsTitle: 'title',
    group: 'Forum',
  },
  access: {
    read: either(moderation, visibleOrOwn),
    create: either(moderation, member),
    update: either(moderation, all(member, ownEntry)),
    delete: moderation,
  },
  indexes: [{ fields: ['category', 'lastActivityAt'] }],
  hooks: {
    beforeValidate: [assignAuthor('author', { polymorphic: true }), uniqueSlug('forumThreads')],
  },
  fields: [
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'forumCategories',
      label: 'Kategoria',
      required: true,
    },
    author,
    { name: 'title', type: 'text', label: 'Tytuł', required: true, minLength: 5, maxLength: 140 },
    slugField('title'),
    { name: 'body', type: 'textarea', label: 'Treść', required: true, maxLength: 10_000 },
    {
      name: 'pinned',
      type: 'checkbox',
      label: 'Przypięty',
      defaultValue: false,
      access: moderationOnly,
    },
    {
      name: 'locked',
      type: 'checkbox',
      label: 'Zamknięty',
      defaultValue: false,
      access: moderationOnly,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: visibility,
      access: moderationOnly,
    },
    {
      name: 'replyCount',
      type: 'number',
      label: 'Odpowiedzi',
      defaultValue: 0,
      access: systemOnly,
    },
    { name: 'lastActivityAt', type: 'date', label: 'Ostatnia aktywność', access: systemOnly },
    {
      name: 'followers',
      type: 'relationship',
      relationTo: 'firmAccounts',
      hasMany: true,
      label: 'Obserwujący',
      access: systemOnly,
    },
  ],
}

/** Odpowiedź (SPEC 3.9): autor edytuje przez 15 minut, do 4 zdjęć. */
export const ForumPosts: CollectionConfig = {
  slug: 'forumPosts',
  labels: { singular: 'Post', plural: 'Posty' },
  admin: { defaultColumns: ['thread', 'author', 'status', 'createdAt'], group: 'Forum' },
  access: {
    read: either(moderation, visibleOrOwn),
    create: either(moderation, member),
    update: either(
      moderation,
      all(member, ownEntry, () => ({
        createdAt: { greater_than: new Date(Date.now() - EDIT_WINDOW_MS).toISOString() },
      })),
    ),
    delete: moderation,
  },
  hooks: {
    beforeValidate: [assignAuthor('author', { polymorphic: true })],
    beforeChange: [
      ({ data, operation }) =>
        operation === 'update' && data.body !== undefined
          ? { ...data, editedAt: new Date().toISOString() }
          : data,
    ],
  },
  fields: [
    {
      name: 'thread',
      type: 'relationship',
      relationTo: 'forumThreads',
      label: 'Wątek',
      required: true,
      index: true,
    },
    author,
    { name: 'body', type: 'textarea', label: 'Treść', required: true, maxLength: 10_000 },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      maxRows: 4,
      label: 'Zdjęcia',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: visibility,
      access: moderationOnly,
    },
    { name: 'editedAt', type: 'date', label: 'Edytowany', access: systemOnly },
    { name: 'helpfulCount', type: 'number', label: 'Pomocne', defaultValue: 0, access: systemOnly },
  ],
}

/** Reakcja „Pomocne” (SPEC 3.9): jedna na post i konto. */
export const ForumReactions: CollectionConfig = {
  slug: 'forumReactions',
  labels: { singular: 'Reakcja', plural: 'Reakcje' },
  admin: { group: 'Forum' },
  access: {
    read: either(moderation, member),
    create: member,
    update: nobody,
    delete: either(moderation, all(member, ownAccount('account'))),
  },
  indexes: [{ fields: ['post', 'account'], unique: true }],
  hooks: { beforeValidate: [assignAuthor('account')] },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'forumPosts',
      label: 'Post',
      required: true,
      index: true,
    },
    {
      name: 'account',
      type: 'relationship',
      relationTo: 'firmAccounts',
      label: 'Konto',
      required: true,
      access: systemOnly,
    },
    {
      name: 'type',
      type: 'select',
      label: 'Rodzaj',
      required: true,
      defaultValue: 'helpful',
      options: options({ helpful: 'Pomocne' }),
    },
  ],
}
