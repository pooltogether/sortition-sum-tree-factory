import { deployContract } from 'ethereum-waffle';
import { waffle } from "@nomiclabs/buidler";
import ExposedSortitionSumTreeFactory from "../build/ExposedSortitionSumTreeFactory.json";
import { expect } from 'chai'
import { ethers } from 'ethers'

const provider = waffle.provider;
const [wallet] = provider.getWallets();

async function call(address: string, fxn: any, params: Array<any>) {
  let callData = fxn.encode(params)
  let response = await provider.call({ to: address, data: callData })
  return fxn.decode(response)
}

describe('SortitionSumTreeFactory', () =>
  it('Should successfully keep track of ID ownership of values and draw them from the tree appropriately.', async () => {
    // Deploy contract
    const sortitionSumTreeFactory = await deployContract(wallet, ExposedSortitionSumTreeFactory)

    // Create tree and populate with 4 candidates
    const tree = { key: ethers.utils.formatBytes32String('1'), K: 2 }
    const candidates = {
      bob: {
        ID:
          '0x0000000000000000000000000000000000000000000000000000000000000002',
        value: 15
      },
      dave: {
        ID:
          '0x0000000000000000000000000000000000000000000000000000000000000004',
        value: 5
      },
      alice: {
        ID:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        value: 10
      },
      carl: {
        ID:
          '0x0000000000000000000000000000000000000000000000000000000000000003',
        value: 20
      }
    }
    await sortitionSumTreeFactory._createTree(tree.key, tree.K)
    for (const candidate of Object.values(candidates)) {
      await sortitionSumTreeFactory._set(
        tree.key,
        candidate.value,
        candidate.ID
      )
    }

    // Test drawing Bob with 13 and Carl with 27
    expect(await sortitionSumTreeFactory._draw(tree.key, 13)).to.equal(
      candidates.bob.ID
    )
    expect(await sortitionSumTreeFactory._draw(tree.key, 27)).to.equal(
      candidates.carl.ID
    )

    // Set Alice to 14 to draw her with 13 and then set her back to 10 to draw Bob again
    await sortitionSumTreeFactory._set(tree.key, 14, candidates.alice.ID)
    expect(await sortitionSumTreeFactory._draw(tree.key, 13)).to.equal(
      candidates.alice.ID
    )
    await sortitionSumTreeFactory._set(tree.key, 10, candidates.alice.ID)
    expect(await sortitionSumTreeFactory._draw(tree.key, 13)).to.equal(
      candidates.bob.ID
    )

    // Remove Carl to draw Dave with 27 and add him back in to draw him again
    await sortitionSumTreeFactory._set(tree.key, 0, candidates.carl.ID)
    expect(await sortitionSumTreeFactory._draw(tree.key, 27)).to.equal(
      candidates.dave.ID
    )
    
    await sortitionSumTreeFactory._set(
      tree.key,
      candidates.carl.value,
      candidates.carl.ID
    )
    expect(await sortitionSumTreeFactory._draw(tree.key, 27)).to.equal(
      candidates.carl.ID
    )

    // Test stake view
    for (const candidate of Object.values(candidates))
      expect(
        await sortitionSumTreeFactory._stakeOf(tree.key, candidate.ID)
      ).to.deep.equal(ethers.utils.bigNumberify(candidate.value))
  })
)
