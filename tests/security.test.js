import test from 'node:test'
import assert from 'node:assert/strict'
import { emailAddress, profile, priceOrder, otpDigest, matches, isUUID } from '../server/security.js'

test('email normalization and rejection', () => {
  assert.equal(emailAddress(' Person@Example.com '), 'person@example.com')
  for (const input of ['', null, 'x@y', 'a b@example.com']) assert.throws(() => emailAddress(input))
})
test('contact number is normalized and validated', () => {
  assert.deepEqual(profile({ name: ' Test User ', phone: '9876543210' }), { name: 'Test User', phone: '+919876543210' })
  assert.throws(() => profile({ name: 'Test', phone: '1234567890' }))
  assert.throws(() => profile({ name: '', phone: '9876543210' }))
})
test('server menu ignores browser supplied prices', () => {
  const result = priceOrder([{ id: 'studio-classic', quantity: 2, price: 1, name: 'Fake' }])
  assert.equal(result.total, 37800)
  assert.equal(result.items[0].name, 'Studio Classic')
})
test('invalid quantities, duplicate and unknown items rejected', () => {
  for (const quantity of [0, -1, 11, 1.5, '1']) assert.throws(() => priceOrder([{ id: 'firebird', quantity }]))
  assert.throws(() => priceOrder([]))
  assert.throws(() => priceOrder([{ id: '__proto__', quantity: 1 }]))
  assert.throws(() => priceOrder([{ id: 'firebird', quantity: 1 }, { id: 'firebird', quantity: 2 }]))
})
test('OTP digest binds challenge, code and secret', () => {
  const hash = otpDigest('challenge', '123456', 'secret')
  assert.ok(matches(hash, otpDigest('challenge', '123456', 'secret')))
  assert.equal(matches(hash, otpDigest('challenge', '123457', 'secret')), false)
  assert.equal(matches(hash, otpDigest('different', '123456', 'secret')), false)
  assert.equal(matches(hash, '00'), false)
})
test('request IDs must be UUIDs', () => {
  assert.ok(isUUID('67b019b3-2b20-4435-824d-a7288d94931c'))
  assert.equal(isUUID('not-an-id'), false)
})
