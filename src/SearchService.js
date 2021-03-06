import requestUtils from "@/RequestUtils";

export default class SearchService {

  constructor(podcastApiUriRoot, tokenProducer) {
    this.podcastApiUrl = podcastApiUriRoot
    this.tokenProducer = tokenProducer
  }

  async searchPodcasts(query) {
    return await requestUtils.jsonRequest(this.podcastApiUrl + '/search?query=' + query, {
      method: 'GET',
      headers: {
        'Accept': 'application/json', 'Authorization': 'bearer ' + this.tokenProducer().token
      }
    })
  }

  async getPodcasts() {
    const p = await requestUtils.jsonRequest(this.podcastApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json', 'Authorization': 'bearer ' + this.tokenProducer().token
      }
    })
    return p
  }
}
