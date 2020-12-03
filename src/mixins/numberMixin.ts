import { Component, Vue } from 'vue-property-decorator'
import BN from 'bignumber.js'

const FORMAT = {
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0
}

BN.config({ FORMAT })

@Component
export default class NumberMixin extends Vue {
  $formatNumber (val: string | number | BN, dp = 3): string {
    if (new BN(val).eq(0)) return '0'
    if (new BN(val).lt(0.000001)) return '< 0.000001'
    if (new BN(val).gte(100000)) return new BN(val).decimalPlaces(0).toFormat()
    if (new BN(val).gte(1000)) return new BN(val).decimalPlaces(2).toFormat()
    return new BN(val).decimalPlaces(dp).toFormat()
  }
}
