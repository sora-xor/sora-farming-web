import axios from 'axios'

const locationCodeExpression = /loc=([\w]{2})/

const getUserLocation = () => {
  return axios.get('https://www.cloudflare.com/cdn-cgi/trace')
    .then(({ data }) => {
      const expressionResult = locationCodeExpression.exec(data)
      return expressionResult
        ? { location: expressionResult[1] }
        : { location: '' }
    })
}

const isUserLocationRestricted = ({ location }: { location: string }, restrictedLocations: string[]) => {
  if (restrictedLocations.includes(location)) return true
  return false
}

export default {
  getUserLocation,
  isUserLocationRestricted
}
