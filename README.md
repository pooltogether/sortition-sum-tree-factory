# SortitionSumTreeFactory

This is a data structure that allows efficient O(log(n)) weighted selection.  This package is an extraction from the Kleros project.  

The majority of this code was written by [Enrique Piqueras](https://twitter.com/epiqueras1).  For an explanation of the code see the [Medium article](https://medium.com/kleros/an-efficient-data-structure-for-blockchain-sortition-15d202af3247).

Thanks to the Kleros team for MIT licensing this *extremely useful* code.

For more information on Sum Trees read [Introduction to Sum Tree](https://www.fcodelabs.com/2019/03/18/Sum-Tree-Introduction/)

# Setup

To install use yarm or npm and install `sortition-sum-tree-factory`:

```sh
$ yarn add sortition-sum-tree-factory
```

```sh
$ npm i sortition-sum-tree-factory
```

# Usage

The SortitionSumTreeFactory is a library that should be attached to the struct SortitionSumTreeFactory.SortitionSumTrees.  This data structure allows you to create many different sortition sum trees.

For example, here we use the library to create a single global sortition sum tree:

```solidity
contract WeightedSelection {
    bytes32 constant private TREE_KEY = keccak256("PoolTogether/SingleRandomWinnerPrizeStrategy");
    uint256 constant private MAX_TREE_LEAVES = 5;

    using SortitionSumTreeFactory for SortitionSumTreeFactory.SortitionSumTrees;

    SortitionSumTreeFactory.SortitionSumTrees sumTreeFactory;

    constructor () public {
        sortitionSumTrees.createTree(TREE_KEY, MAX_TREE_LEAVES);
    }
}
```

Let's assume the sortition sum tree is storing user token balances.

Now you can set the balances using the `set` function:

```solidity
function updateBalanceOf(address user, uint256 amount) external override {
    sortitionSumTrees.set(TREE_KEY, amount, bytes32(uint256(user)));
}
```

When we want to select someone proportionally we can use `draw`:

```solidity
function randomlyDrawUser() public view returns (address) {
    bytes32 entropy = blockhash(1);
    uint256 token = UniformRandomNumber.uniform(uint256(entropy), bound);
    return address(uint256(sortitionSumTrees.draw(TREE_KEY, token)));
}
```

The probability that a user is selected is proportional to their token balance.

Note the use of [UniformRandomNumber](https://github.com/pooltogether/uniform-random-number).  This library eliminates modulo bias when constraining large numbers into a smaller set.

# Development

Install the dependencies:

```sh
$ yarn
```

Now run the tests:

```sh
$ yarn test
```