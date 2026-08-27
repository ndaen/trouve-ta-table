import { test } from '@japa/runner'
import { normalizeSearchText, tokenizeSearchQuery } from '#utils/search_text'

test.group('Normalisation de recherche', () => {
    test('supprime les accents', ({ assert }) => {
        assert.equal(normalizeSearchText('José'), 'jose')
        assert.equal(normalizeSearchText('JOSÉ'), 'jose')
        assert.equal(normalizeSearchText('Chloë Lefèvre'), 'chloe lefevre')
    })

    test('remplace la ponctuation par des espaces', ({ assert }) => {
        assert.equal(normalizeSearchText("Jean-Pierre O'Connor"), 'jean pierre o connor')
    })

    test('réduit les espaces multiples et coupe les bords', ({ assert }) => {
        assert.equal(normalizeSearchText('  Martin   DUPONT  '), 'martin dupont')
    })

    test('découpe la requête en tokens', ({ assert }) => {
        assert.deepEqual(tokenizeSearchQuery('Dupont  Martin'), ['dupont', 'martin'])
    })

    test('une requête sans caractère utile ne produit aucun token', ({ assert }) => {
        assert.deepEqual(tokenizeSearchQuery('   '), [])
        assert.deepEqual(tokenizeSearchQuery('---'), [])
    })
})
