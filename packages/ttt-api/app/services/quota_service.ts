import { Exception } from '@adonisjs/core/exceptions'
import Guest from '#models/guest'

export class QuotaExceededException extends Exception {
    static status = 422
    static code = 'E_QUOTA_EXCEEDED'
}

export default class QuotaService {
    /**
     * Limite haute au premier jalon : garde-fou anti-abus, pas barrière
     * commerciale. Aucun moyen de paiement n'existe encore, donc bloquer bas
     * enfermerait le couple sans porte de sortie.
     */
    static MAX_GUESTS_PER_PROJECT = 150

    static async assertCanAddGuests(projectId: string, count: number): Promise<void> {
        const [{ total }] = await Guest.query()
            .where('projectId', projectId)
            .count('* as total')
            .pojo<{ total: string }>()

        const actuel = Number(total)
        if (actuel + count > this.MAX_GUESTS_PER_PROJECT) {
            throw new QuotaExceededException(
                `Ce projet est limité à ${this.MAX_GUESTS_PER_PROJECT} invités. ` +
                    `Il en compte ${actuel} et vous tentez d'en ajouter ${count}.`
            )
        }
    }
}
