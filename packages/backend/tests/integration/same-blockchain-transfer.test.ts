import request from 'supertest';
import app from '../../src/server';
import { Ledger } from '@blockchain-omnibus/shared';

describe('Same Blockchain Transfer', () => {
  let alice: any;
  let bob: any;

  beforeAll(async () => {
    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  it('should create two users with accounts', async () => {
    // Create Alice
    const aliceRes = await request(app)
      .post('/api/users')
      .send({
        name: 'Alice Test',
        email: 'alice@test.com',
        initialBlockchains: [Ledger.ETHEREUM],
      });

    expect(aliceRes.status).toBe(201);
    alice = aliceRes.body.data.user;

    // Create Bob
    const bobRes = await request(app)
      .post('/api/users')
      .send({
        name: 'Bob Test',
        email: 'bob@test.com',
        initialBlockchains: [Ledger.ETHEREUM],
      });

    expect(bobRes.status).toBe(201);
    bob = bobRes.body.data.user;
  });

  it('should deposit funds to Alice', async () => {
    const res = await request(app)
      .post('/api/transactions/deposit')
      .send({
        userId: alice.id,
        amount: 1000,
        ledger: Ledger.ETHEREUM,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.transaction.status).toBe('posted');
  });

  it('should transfer from Alice to Bob', async () => {
    const res = await request(app)
      .post('/api/transactions/transfer')
      .send({
        fromUserId: alice.id,
        toUserId: bob.id,
        amount: 250,
        ledger: Ledger.ETHEREUM,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.transaction.status).toBe('posted');
    expect(res.body.data.transaction.amountFormatted).toBe('250.00');
  });

  it('should verify balances after transfer', async () => {
    const aliceRes = await request(app).get(`/api/users/${alice.id}`);
    const bobRes = await request(app).get(`/api/users/${bob.id}`);

    const aliceBalance = aliceRes.body.data.user.balances.find(
      (b: any) => b.ledger === Ledger.ETHEREUM
    );
    const bobBalance = bobRes.body.data.user.balances.find(
      (b: any) => b.ledger === Ledger.ETHEREUM
    );

    expect(aliceBalance.balanceFormatted).toBe('750.00');
    expect(bobBalance.balanceFormatted).toBe('250.00');
  });

  it('should fail transfer with insufficient funds', async () => {
    const res = await request(app)
      .post('/api/transactions/transfer')
      .send({
        fromUserId: bob.id,
        toUserId: alice.id,
        amount: 5000, // Bob only has 250
        ledger: Ledger.ETHEREUM,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.transaction.status).toBe('failed');
  });
});

