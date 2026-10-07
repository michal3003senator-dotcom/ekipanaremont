import type { Access } from 'payload'

/** Dostęp tylko dla zalogowanego personelu. Role (admin, moderator, redaktor) dochodzą w fazie 3. */
export const isStaff: Access = ({ req: { user } }) => user?.collection === 'staff'
