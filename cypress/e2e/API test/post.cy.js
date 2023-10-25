const users = require('../../fixtures/loginTestData.json');
import { faker } from '@faker-js/faker';

function createTestData() {
	const randomNumber = Math.floor(Math.random() * users.length);
	return users[randomNumber];
}

let user = createTestData();

let token;
let postId;
const fileType = 'image/jpg';
const fileType2 = 'image/png';
let uploadId;
let uploadId2;
let imageID;
let imageBody;
let imageBody2;
let postBody;
let postDesc1 = faker.lorem.word(499);
let postDesc2 = faker.lorem.word(5);

describe('Post ', () => {
	before('Log in', () => {
		cy.request({
			method: 'POST',
			url: 'https://inctagram.net/api/v1/auth/login',
			body: {
				email: user.userEmail,
				password: user.userPassword,
			},
		}).then((res) => {
			token = res.body.accessToken;
			expect(res.status).to.eq(200);
		});
	});

	it(
		'Upload the first image for a new post',
		{ tags: ['@smoke', '@regression'] },
		() => {
			cy.fixture('images/image.jpg', 'binary').then((file) => {
				const blob = Cypress.Blob.binaryStringToBlob(file, fileType);
				const formdata = new FormData();
				formdata.set('file', blob, 'image.jpg');
				cy.form_request(
					'POST',
					'https://inctagram.net/api/v1/posts/image',
					formdata,
					`Bearer ${token}`,
					function (res) {
						expect(res.status).to.eq(201);
						const json = res.response;
						imageBody = JSON.parse(json);
						cy.log(imageBody);
						uploadId = imageBody.images[0].uploadId;
						cy.log(uploadId);
						expect(imageBody).to.have.property('images');
						expect(imageBody.images).to.have.length(2);
						expect(imageBody.images[0]).to.have.property('url');
						expect(imageBody.images[0]).to.have.property(
							'uploadId'
						);
						expect(imageBody.images[0]).to.have.property(
							'fileSize'
						);
						expect(imageBody.images[0]).to.have.property('width');
						expect(imageBody.images[0]).to.have.property('height');
					}
				);
			});
		}
	);

	it(
		'Upload the second image for a new post',
		{ tags: ['@smoke', '@regression'] },
		() => {
			cy.fixture('images/image.png', 'binary').then((file) => {
				const blob = Cypress.Blob.binaryStringToBlob(file, fileType2);
				const formdata = new FormData();
				formdata.set('file', blob, 'image.png');
				cy.form_request(
					'POST',
					'https://inctagram.net/api/v1/posts/image',
					formdata,
					`Bearer ${token}`,
					function (res) {
						expect(res.status).to.eq(201);
						const json = res.response;
						imageBody2 = JSON.parse(json);
						cy.log(imageBody2);
						uploadId2 = imageBody2.images[0].uploadId;
						cy.log(uploadId2);
						expect(imageBody2).to.have.property('images');
						expect(imageBody2.images).to.have.length(2);
						expect(imageBody2.images[0]).to.have.property('url');
						expect(imageBody2.images[0]).to.have.property(
							'uploadId'
						);
						expect(imageBody2.images[0]).to.have.property(
							'fileSize'
						);
						expect(imageBody2.images[0]).to.have.property('width');
						expect(imageBody2.images[0]).to.have.property('height');
					}
				);
			});
		}
	);

	it(
		'Create a new post with two images',
		{ tags: ['@smoke', '@regression'] },
		() => {
			cy.request({
				method: 'POST',
				url: 'https://inctagram.net/api/v1/posts',
				body: {
					description: postDesc1,
					childrenMetadata: [
						{
							uploadId: uploadId,
						},
						{
							uploadId: uploadId2,
						},
					],
				},
				headers: { Authorization: `Bearer ${token}` },
			}).then((res) => {
				expect(res.status).to.eq(201);
				postBody = res.body;
				expect(res.body).to.have.property('id');
				postId = res.body.id;
				expect(res.body).to.have.property('description');
				expect(res.body).to.have.property('location');
				expect(res.body).to.have.property('images');
				expect(res.body.images).to.have.length(4);

				expect(res.body).to.have.property('createdAt');
				expect(res.body).to.have.property('updatedAt');
			});
		}
	);

	it(
		'Create a new post without autorisation',
		{ tags: ['@smoke', '@regression'] },
		() => {
			cy.request({
				method: 'POST',
				url: 'https://inctagram.net/api/v1/posts',
				body: {
					description: postDesc1,
					childrenMetadata: [
						{
							uploadId: uploadId,
						},
					],
				},
				failOnStatusCode: false,
			}).then((res) => {
				expect(res.status).to.eq(401);
				expect(res.body).to.have.property('statusCode', 401);
				expect(res.body).to.have.property('messages');
				expect(res.body).to.have.property('error', 'Unauthorized');
				expect(res.body.messages[0]).to.have.property(
					'message',
					'Authorization error'
				);
			});
		}
	);

	it('Get post by id', { tags: ['@smoke', '@regression'] }, () => {
		cy.request({
			method: 'GET',
			url: `https://inctagram.net/api/v1/posts/p/${postId}`,
			headers: { Authorization: `Bearer ${token}` },
		}).then((res) => {
			expect(res.status).to.eq(200);
			expect(res.body).to.eql(postBody);
		});
	});

	it('Get post with wrong id', { tags: ['@smoke', '@regression'] }, () => {
		cy.request({
			method: 'GET',
			url: 'https://inctagram.net/api/v1/posts/p/199',
			headers: { Authorization: `Bearer ${token}` },
			failOnStatusCode: false,
		}).then((res) => {
			expect(res.status).to.eq(404);
		});
	});

	it('Update the post', { tags: ['@smoke', '@regression'] }, () => {
		cy.request({
			method: 'PUT',
			url: `https://inctagram.net/api/v1/posts/${postId}`,
			body: {
				description: postDesc2,
			},
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				expect(res.status).to.eq(204);
			})
			.then('Get post by id after updating', () => {
				cy.request({
					method: 'GET',
					url: `https://inctagram.net/api/v1/posts/p/${postId}`,
					headers: { Authorization: `Bearer ${token}` },
				}).then((res) => {
					expect(res.status).to.eq(200);
					expect(res.body.description).to.equal(postDesc2);
				});
			});
	});

	it(
		'Update the post without autorisation',
		{ tags: ['@smoke', '@regression'] },
		() => {
			cy.request({
				method: 'PUT',
				url: `https://inctagram.net/api/v1/posts/${postId}`,
				body: {
					description: postDesc2,
				},
				failOnStatusCode: false,
			}).then((res) => {
				expect(res.status).to.eq(401);
				expect(res.body).to.have.property('statusCode', 401);
				expect(res.body).to.have.property('messages');
				expect(res.body).to.have.property('error', 'Unauthorized');
				expect(res.body.messages[0]).to.have.property(
					'message',
					'Authorization error'
				);
			});
		}
	);

	it(
		'Get all post in the system',
		{ tags: ['@smoke', '@regression'] },
		() => {
			cy.request({
				method: 'GET',
				url: `https://inctagram.net/api/v1/posts/all/${postId}?pageSize=8&sortBy=createdAt&sortDirection=desc`,
				headers: { Authorization: `Bearer ${token}` },
			}).then((res) => {
				expect(res.status).to.eq(200);
				expect(res.body).to.have.property('totalCount');
				expect(res.body).to.have.property('pageSize', 8);
				expect(res.body).to.have.property('items');
				expect(res.body.items).to.have.length(1);
			});
		}
	);

	it('Get all users post', { tags: ['@smoke', '@regression'] }, () => {
		cy.request({
			method: 'GET',
			url: `https://inctagram.net/api/v1/posts/user/${postId}?pageSize=8&sortBy=createdAt&sortDirection=desc`,
			headers: { Authorization: `Bearer ${token}` },
		}).then((res) => {
			expect(res.status).to.eq(200);
			expect(res.body).to.have.property('totalCount', 1);
			expect(res.body).to.have.property('pageSize');
			expect(res.body).to.have.property('items');
			expect(res.body.items).to.have.length(2);
		});
	});

	it('Delete post by post id', { tags: ['@smoke', '@regression'] }, () => {
		cy.request({
			method: 'DELETE',
			url: `https://inctagram.net/api/v1/posts/37`,
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				expect(res.status).to.eq(204);
			})
			.then('Get post by id', () => {
				cy.request({
					method: 'GET',
					url: `https://inctagram.net/api/v1/posts/p/37`,
					headers: { Authorization: `Bearer ${token}` },
					failOnStatusCode: false,
				}).then((res) => {
					expect(res.status).to.eq(404);
				});
			});
	});

	it('Delete image by image id', { tags: ['@smoke', '@regression'] }, () => {
		cy.fixture('images/image.png', 'binary').then((file) => {
			const blob = Cypress.Blob.binaryStringToBlob(file, fileType2);
			const formdata = new FormData();
			formdata.set('file', blob, 'image.png');
			cy.form_request(
				'POST',
				'https://inctagram.net/api/v1/posts/image',
				formdata,
				`Bearer ${token}`,
				function (res) {
					expect(res.status).to.eq(201);
					const json = res.response;
					const body = JSON.parse(json);
					imageID = body.images[0].uploadId;
				}
			).then(() => {
				cy.request({
					method: 'DELETE',
					url: `https://inctagram.net/api/v1/posts/image/${imageID}`,
					headers: { Authorization: `Bearer ${token}` },
				}).then((res) => {
					expect(res.status).to.eq(204);
				});
			});
		});
	});
});
