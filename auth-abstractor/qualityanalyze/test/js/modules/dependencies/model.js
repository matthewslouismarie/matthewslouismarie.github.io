/* eslint max-len: [2, 150] */
/* globals describe, beforeEach, it, expect */

import Model from '../../../../src/js/modules/dependencies/model.js'

describe("Module/Depenencies/Model", function () {
    beforeEach(function () {
        Math.random = (function () {
            var seed = 0x2F6E2B1
            return function () {
                // Robert Jenkins’ 32 bit integer hash function
                seed = ((seed + 0x7ED55D16) + (seed << 12)) & 0xFFFFFFFF
                seed = ((seed ^ 0xC761C23C) ^ (seed >>> 19)) & 0xFFFFFFFF
                seed = ((seed + 0x165667B1) + (seed << 5)) & 0xFFFFFFFF
                seed = ((seed + 0xD3A2646C) ^ (seed << 9)) & 0xFFFFFFFF
                seed = ((seed + 0xFD7046C5) + (seed << 3)) & 0xFFFFFFFF
                seed = ((seed ^ 0xB55A4F09) ^ (seed >>> 16)) & 0xFFFFFFFF
                return (seed & 0xFFFFFFF) / 0x10000000
            }
        }())
    })

    var dependencyExample = {
        package: [{
            $: { name: "P_1" },
            class: [{
                $: { name: "C_1_1" },
                efferent: [{
                    type: [
                        { $: { namespace: "P_1", name: "C_1_2" } },
                    ],
                }],
            }, {
                $: { name: "C_1_2" },
                efferent: [{
                    type: [
                        { $: { namespace: "P_2\\1", name: "C_2_1_1" } },
                        { $: { namespace: "External", name: "Something" } },
                    ],
                }],
            }],
        }, {
            $: { name: "P_2\\1" },
            class: [{
                $: { name: "C_2_1_1" },
                efferent: [{
                    type: [
                        { $: { namespace: "P_1", name: "C_1_1" } },
                    ],
                }],
            }],
        }],
    }

    it("gets initial set of leaves", function () {
        var model = new Model()

        expect(model.getLeaves())
            .toEqual([
                { id: '0', name: '/', fullName: '/', type: 'package', size: -1, depth: 0, hidden: true },
            ])
    })

    it("analyzes leaves for default data set", function () {
        var model = new Model()

        model.calculateDependencyTree(dependencyExample)
        expect(model.getLeaves())
            .toEqual([
                { id: '0', name: '/', fullName: '/', type: 'package', size: 3, depth: 0, hidden: true },
                { id: 'zjimef', name: 'P_1', fullName: 'P_1', type: 'package', size: 2, depth: 1, hidden: false },
                { id: 'zyq4vi', name: 'P_2', fullName: 'P_2', type: 'package', size: 1, depth: 1, hidden: false },
                { id: 'tpubzs', name: '<$external>', fullName: '$external', type: 'type', size: 0, depth: 1, hidden: false },
            ])
    })

    it("analyzes leaves for default data set after unfolding", function () {
        var model = new Model()

        model.calculateDependencyTree(dependencyExample)
        model.findAndUnfold("zyq4vi")
        expect(model.getLeaves())
            .toEqual([
                { id: '0', name: '/', fullName: '/', type: 'package', size: 3, depth: 0, hidden: true },
                { id: 'zjimef', name: 'P_1', fullName: 'P_1', type: 'package', size: 2, depth: 1, hidden: false },
                { id: 'zyq4vi', name: 'P_2', fullName: 'P_2', type: 'package', size: 1, depth: 1, hidden: true },
                { id: 'tukvg7', name: '1', fullName: 'P_2\\1', type: 'package', size: 1, depth: 2, hidden: false },
                { id: 'tpubzs', name: '<$external>', fullName: '$external', type: 'type', size: 0, depth: 1, hidden: false },
            ])
    })

    it("analyzes leaves for default data set after unfolding and folding", function () {
        var model = new Model()

        model.calculateDependencyTree(dependencyExample)
        model.findAndUnfold("zyq4vi")
        model.findAndUnfold("zyq4vi")
        expect(model.getLeaves())
            .toEqual([
                { id: '0', name: '/', fullName: '/', type: 'package', size: 3, depth: 0, hidden: true },
                { id: 'zjimef', name: 'P_1', fullName: 'P_1', type: 'package', size: 2, depth: 1, hidden: false },
                { id: 'zyq4vi', name: 'P_2', fullName: 'P_2', type: 'package', size: 1, depth: 1, hidden: false },
                { id: 'tpubzs', name: '<$external>', fullName: '$external', type: 'type', size: 0, depth: 1, hidden: false },
            ])
    })

    it("analyzes leaves without efferent types", function () {
        var model = new Model()

        model.calculateDependencyTree({
            package: [{
                $: { name: "P_1" },
                class: [
                    { $: { name: "C_1_1" } },
                ],
            }],
        })

        expect(model.getLeaves())
            .toEqual([
                { id: '0', name: '/', fullName: '/', type: 'package', size: 1, depth: 0, hidden: true },
                { id: 'zjimef', name: 'P_1', fullName: 'P_1', type: 'package', size: 1, depth: 1, hidden: false },
                { id: 'k9wcky', name: '<$external>', fullName: '$external', type: 'type', size: 0, depth: 1, hidden: false },
            ])
    })

    it("analyzes leaves with single efferent type", function () {
        var model = new Model()

        model.calculateDependencyTree({
            package: [{
                $: { name: "P_1" },
                class: [{
                    $: { name: "C_1_1" },
                    efferent: [
                        { $: { type: { namespace: "P_1", name: "C_1_2" } } },
                    ],
                }],
            }],
        })

        expect(model.getLeaves())
            .toEqual([
                { id: '0', name: '/', fullName: '/', type: 'package', size: 1, depth: 0, hidden: true },
                { id: 'zjimef', name: 'P_1', fullName: 'P_1', type: 'package', size: 1, depth: 1, hidden: false },
                { id: 'k9wcky', name: '<$external>', fullName: '$external', type: 'type', size: 0, depth: 1, hidden: false },
            ])
    })

    it("analyzes type and package with same name", function () {
        var model = new Model()

        model.calculateDependencyTree({
            package: [{
                $: { name: "P_1" },
                class: [
                    { $: { name: "C_1_1" } },
                ],
            }, {
                $: { name: "P_1\\C_1_1" },
                class: [
                    { $: { name: "C_1_1_1" } },
                ],
            }],
        })

        model.findAndUnfold('zjimef')

        expect(model.getLeaves())
            .toEqual([
                { id: '0', name: '/', fullName: '/', type: 'package', size: 2, depth: 0, hidden: true },
                { id: 'zjimef', name: 'P_1', fullName: 'P_1', type: 'package', size: 2, depth: 1, hidden: true },
                { id: 'ck1rmf', name: '<C_1_1>', fullName: 'P_1\\C_1_1', type: 'type', size: 0, depth: 2, hidden: false },
                { id: 'k9wcky', name: 'C_1_1', fullName: 'P_1\\C_1_1', type: 'package', size: 1, depth: 2, hidden: false },
                { id: 'tukvg7', name: '<$external>', fullName: '$external', type: 'type', size: 0, depth: 1, hidden: false },
            ])
    })

    it("analyzes depencies on empty tree", function () {
        var model = new Model()

        expect(model.calculateDependencies(model.getLeaves()))
            .toEqual([])
    })

    it("analyzes folded depencies", function () {
        var model = new Model()

        model.calculateDependencyTree(dependencyExample)
        expect(model.calculateDependencies(model.getLeaves()))
            .toEqual([
                { source: "zjimef", target: "zyq4vi", count: 1 },
                { source: "zjimef", target: "tpubzs", count: 1 },
                { source: "zyq4vi", target: "zjimef", count: 1 },
            ])
    })

    it("analyzes unfolded depencies", function () {
        var model = new Model()

        model.calculateDependencyTree(dependencyExample)
        model.findAndUnfold("zyq4vi")

        expect(model.calculateDependencies(model.getLeaves()))
            .toEqual([
                { source: "zjimef", target: "tukvg7", count: 1 },
                { source: "zjimef", target: "tpubzs", count: 1 },
                { source: "tukvg7", target: "zjimef", count: 1 },
            ])
    })

    it("analyzes entirely unfolded depencies", function () {
        var model = new Model()

        model.calculateDependencyTree(dependencyExample)
        model.findAndUnfold('zjimef')
        model.findAndUnfold('zyq4vi')
        model.findAndUnfold('tukvg7')

        expect(model.calculateDependencies(model.getLeaves()))
            .toEqual([
                { source: 'ck1rmf', target: 'k9wcky', count: 1 },
                { source: 'k9wcky', target: '4rowb6', count: 1 },
                { source: 'k9wcky', target: 'tpubzs', count: 1 },
                { source: '4rowb6', target: 'ck1rmf', count: 1 },
            ])
    })
})
