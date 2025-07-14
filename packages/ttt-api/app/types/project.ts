import {DateTime} from "luxon";

export enum EventType {
	WEDDING = 'wedding',
	BAR_MITZVAH = 'bar_mitzvah',
	ANNIVERSARY = 'anniversary',
	CORPORATE = 'corporate',
	BIRTHDAY = 'birthday',
	OTHER = 'other'
}

export type UUID = string

export interface ProjectPayload {
	name: string
	eventType: EventType
	eventDate: DateTime
	venue: string
	description?: string
	userId: string
}
