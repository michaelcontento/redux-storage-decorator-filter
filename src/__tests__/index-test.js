import { Map as map } from 'immutable';

import filter from '../';

describe('decorator', () => {
    it('should proxy load to engine.load', () => {
        const load = sinon.spy();
        const engine = filter({ load });

        engine.load();

        load.should.have.been.called;
    });

    it('should have a empty whitelist by default', () => {
        const save = sinon.spy();
        const engine = filter({ save });

        engine.save({ key: 'value' });

        save.should.have.been.calledWith({});
    });

    it('should save whitelisted keys', () => {
        const save = sinon.spy();
        const engine = filter({ save }, ['key']);

        engine.save({ key: 'value', ignored: true });

        save.should.have.been.calledWith({ key: 'value' });
    });

    it('should save whitelisted keys paths', () => {
        const save = sinon.spy();
        const engine = filter({ save }, [['some', 'key']]);

        engine.save({ some: { key: 'value' }, ignored: true });

        save.should.have.been.calledWith({ some: { key: 'value' } });
    });

    it('should ignore not existing but whitelisted keys', () => {
        const save = sinon.spy();
        const engine = filter({ save }, ['key']);

        engine.save({ ignored: true });

        save.should.have.been.calledWith({});
    });

    it('should ignore not existing but whitelisted key paths', () => {
        const save = sinon.spy();
        const engine = filter({ save }, [['a', 'nonExistingProp']]);

        engine.save({ a: { existingProp: true } });

        save.should.have.been.calledWith({});
    });

    it('should support whitelisting an immutable', () => {
        const save = sinon.spy();
        const engine = filter({ save }, [['some', 'key']]);

        engine.save({ some: map({ key: 42 }) });

        save.should.have.been.calledWith({ some: { key: 42 } });
    });

    it('should handle null values (PR #64)', () => {
        const save = sinon.spy();
        const engine = filter({ save }, [['a', 'first']]);

        engine.save({ a: { first: null, second: 2 } });

        save.should.have.been.calledWith({ a: { first: null } });
    });

    it('should handle null values (PR #64) - immutable', () => {
        const save = sinon.spy();
        const engine = filter({ save }, [['a', 'first']]);

        engine.save(map({ a: { first: null, second: 2 } }));

        save.should.have.been.calledWith({ a: { first: null } });
    });

    it('should have a empty blacklist by default', () => {
        const save = sinon.spy();
        const engine = filter({ save }, ['key']);

        engine.save({ key: 'value' });

        save.should.have.been.calledWith({ key: 'value' });
    });

    it('should not save blacklisted keys', () => {
        const save = sinon.spy();
        const engine = filter({ save }, ['ignored'], ['ignored']);

        engine.save({ key: 'value', ignored: true });

        save.should.have.been.calledWith({});
    });

    it('should not save blacklisted keys paths', () => {
        const save = sinon.spy();
        const engine = filter({ save }, ['key', 'some'], [['some', 'ignored']]);

        engine.save({ key: 'value', some: { ignored: true } });

        save.should.have.been.calledWith({ key: 'value', some: {} });
    });

    it('should NOT change the passed state with a blacklist (issue #13)', () => {
        const save = sinon.spy();
        const engine = filter({ save }, null, [['some', 'a']]);

        const state = { some: { a: 1, b: 2 } };
        engine.save(state);

        state.should.deep.equal({ some: { a: 1, b: 2 } });
    });

    it('should ignore not existing but blacklisted keys', () => {
        const save = sinon.spy();
        const engine = filter({ save }, ['key'], ['ignored']);

        engine.save({ key: 'value' });

        save.should.have.been.calledWith({ key: 'value' });
    });

    it('should ignore not existing but blacklisted key paths', () => {
        const save = sinon.spy();
        const engine = filter({ save }, ['key'], [['some', 'ignored']]);

        engine.save({ key: 'value' });

        save.should.have.been.calledWith({ key: 'value' });
    });

    it('should support blacklisting an immutable', () => {
        const save = sinon.spy();
        const engine = filter({ save }, [['some', 'key']], [['some', 'key']]);

        engine.save({ some: map({ key: 42 }) });

        save.should.have.been.calledWith({ some: {} });
    });

    it('should handle null values (PR #64)', () => {
        const save = sinon.spy();
        const engine = filter({ save }, [['a', 'first']], [['a', 'first']]);

        engine.save({ a: { first: null, second: 2 } });

        save.should.have.been.calledWith({ a: {} });
    });

    it('should handle null values (PR #64) - immutable', () => {
        const save = sinon.spy();
        const engine = filter({ save }, [['a', 'first']], [['a', 'first']]);

        engine.save(map({ a: { first: null, second: 2 } }));

        save.should.have.been.calledWith({ a: {} });
    });

    it('should support blacklist only', () => {
        const save = sinon.spy();
        const engine = filter({ save }, [], ['b']);

        engine.save({ a: 1, b: 2 });

        save.should.have.been.calledWith({ a: 1 });
    });

    it('should support blacklist only - explicit null whitelist', () => {
        const save = sinon.spy();
        const engine = filter({ save }, null, ['b']);

        engine.save({ a: 1, b: 2 });

        save.should.have.been.calledWith({ a: 1 });
    });

    it('should support multiple blacklist with partially similar path', () => {
        const save = sinon.spy();
        const engine = filter({ save }, null, [['a', '1'], ['a', '2']]);

        engine.save({ a: { '1': 1, '2': 2, '3': 3 } });

        save.should.have.been.calledWith({ a: { '3': 3 } });
    });

    it('should support multiple blacklist with partially similar path - immutable', () => {
        const save = sinon.spy();
        const engine = filter({ save }, ['a'], [['a', '1'], ['a', '2']]);

        engine.save({ a: map({ '1': 1, '2': 2 }) });

        save.should.have.been.calledWith({ a: map({ }) });
    });

    it('should support empty blacklist', () => {
        const save = sinon.spy();
        const engine = filter({ save }, null, []);

        engine.save({ a: { '1': 1, '2': 2 } });

        save.should.have.been.calledWith({ a: { '1': 1, '2': 2 } });
    });
});
