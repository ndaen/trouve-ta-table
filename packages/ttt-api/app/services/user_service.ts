import User from "#models/user";

export class UserService {
	public async getAll() {
		return User.query().preload('projects');
	}

	public async getById(userId: string) {
		return User.query().where('id', userId).preload('projects').first();
	}

	public async updateUser(userId: string, payload: Partial<User>) {
		const user = await User.findBy('id', userId);
		if (!user) {
			return {
				error: 'User not found',
				status: 404
			};
		}
		user.merge(payload);
		await user.save();
		return user;
	}

	public async deleteUser(userId: string, user: User) {
		const userToDelete = await User.findBy('id', userId);
		if (!userToDelete) {
			return {
				error: 'User not found',
				status: 404
			};
		}
		if (user.id !== userToDelete.id && user.role !== 'admin') {
			return {
				error: 'You do not have permission to delete this user',
				status: 403
			};
		}
		await userToDelete.delete();
		return {message: `User with ID: ${userId} deleted successfully`};
	}
}
