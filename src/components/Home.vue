<template>
  <div>
    <nav class="navbar navbar-expand navbar-light bg-light justify-content-between px-5">
      <span class="navbar-brand">Playlist Generator</span>
      <a
          v-bind:href="ssoUrl"
          v-if="token.length < 1"
          class="btn btn-success"
      >
        Log in with Spotify
      </a>
      <span v-if="userId.length > 1">Signed in as: {{ userId }}</span>
    </nav>

    <div v-if="token.length > 0">
      <div class="row my-3">
        <div class="col mx-5">
          <form v-on:submit.prevent="doSearch">
            <div class="row my-3">
              <div class="col">
                <div class="input-group">
                  <input
                      v-model="trackSearchTerm"
                      id="track"
                      placeholder="Song or Artist (or Both)"
                      type="text"
                      class="form-control"
                  >
                  <button type="submit" class="btn btn-primary">
                    Search
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div v-if="tracksSelected.length > 0" class="row">
        <div class="col mx-5">
          <h3>Selected Tracks</h3>
          <table class="table mt-3">
            <thead>
            <tr>
              <th scope="col" class="col-1">&nbsp;</th>
              <th scope="col" class="col-6">Track Name</th>
              <th scope="col" class="col-5">Artist</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(track, index) in tracksSelected">
              <td class="text-center">
                <button
                    v-on:click="unselectTrack(index)"
                    type="button"
                    class="btn btn-warning"
                >
                  <strong>Remove</strong>
                </button>
              </td>
              <td>{{ $filters.truncate(track.name, 60, '...') }}</td>
              <td>{{ $filters.truncate(track.artists.map(({name}) => name).join(", "), 45, '...') }}</td>
            </tr>
            </tbody>
          </table>

        </div>
      </div>

      <div v-if="tracksSelected.length > 0" class="row mx-5">
        <div class="col">
          <div class="row">
            <div class="col">&nbsp;</div>
            <div class="col">
              <label for="minLoudness" class="form-label">Min Loudness: {{ minLoudness * 100 }} </label>
              <input v-model="minLoudness" type="range" class="form-range" min="0" v-bind:max="1" step="0.1"
                     id="minLoudness">
            </div>
          </div>
          <div class="row">
            <div class="col">&nbsp;</div>
            <div class="col">
              <label for="maxLoudness" class="form-label">Max Loudness: {{ maxLoudness * 100 }}</label>
              <input v-model="maxLoudness" type="range" class="form-range" v-bind:min="0" max="1" step="0.1"
                     id="maxLoudness">
            </div>
          </div>
        </div>
      </div>

      <div v-if="tracksFound.length" class="row m-5 text-center">
        <div class="col">
          <div class="row text-left">
            <div v-if="tracksFound.length > 8" class="col-8">
              <input
                  v-model="playlistName"
                  id="playlistName"
                  placeholder="Name of Playlist"
                  type="text"
                  class="form-control"
              >
            </div>
            <div v-if="tracksFound.length > 8" class="col-4">
              <button
                  v-on:click="saveRecommendations"
                  v-bind:disabled="playlistName.length === 0"
                  type="button"
                  class="btn btn-primary"
              >
                Save Playlist
              </button>
              <!--        <p>Saved: <span v-if="saved">SUCCESS!</span></p>-->
            </div>
          </div>
        </div>

        <div class="col-4">
          <button
              v-on:click="getRecommendations"
              v-bind:disabled="tracksSelected.length < 1"
              type="button"
              class="btn btn-primary"
          >
            <span v-if="tracksSelected.length > 0">Get Recommendations</span>
            <span v-else>Select Tracks</span>
          </button>
        </div>
      </div>

      <div v-if="tracksFound.length" class="row mt-5">
        <div class="col mx-5">
          <h3 v-if="tracksFound.length > 8">Recommended Songs ({{ tracksFound.length }})</h3>
          <h3 v-else>Search Results</h3>
          <table class="table mt-3">
            <thead>
            <tr>
              <th scope="col" class="col-1">&nbsp;</th>
              <th scope="col" class="col-6">Track Name</th>
              <th scope="col" class="col-5">Artist</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="track in tracksFound">
              <td class="text-center">
                <button
                    v-on:click="selectTrack(track)"
                    type="button"
                    class="btn btn-success"
                    v-bind:disabled="tracksSelected.length >= 5"
                >
                  <strong>Add</strong>
                </button>
              </td>
              <td>{{ $filters.truncate(track.name, 60, '...') }}</td>
              <td>{{ $filters.truncate(track.artists.map(({name}) => name).join(", "), 45, '...') }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
    <div class="row m-5">
      <div class="col">
        <p>
          This site allows you to generate and save a Spotify Playlist!
        </p>
        <ol>
          <li>Sign in w/ button in upper right (if necessary)</li>
          <li>Search for a song</li>
          <li>Add up to 5 songs</li>
          <li>Select minimum and maximum loudness of songs if you like</li>
          <li>Click 'Get Recommendations'</li>
          <li>Enter a name for the playlist</li>
          <li>Click 'Save Playlist'</li>
          <li>Open Spotify and find your playlist added!</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  props: {},
  data() {
    return {
      token: "",
      userId: "",
      trackSearchTerm: "",
      tracksSelected: [],
      tracksFound: [],
      playlistName: "",
      ssoUrl: "",
      minLoudness: 0,
      maxLoudness: 1,
    }
  },
  created() {
    console.info('Page loaded')
    const self = this;
    const parsedUrl = new URL(window.location.href)
    const hashValue = parsedUrl.hash
    console.debug('  hash value: ', hashValue)

    if (hashValue.length > 2) {
      const hashComponents = hashValue.split("&")
      const tokenComponents = hashComponents[0].split('=')
      this.token = tokenComponents[1]

      fetch('https://api.spotify.com/v1/me', {
        headers: {
          "Authorization": "Bearer " + this.token
        }
      })
          .then(function (response) {
            if (response.ok) {
              return response.json()
            } else {
              self.token = ""
            }
          })
          .then(function (data) {
            self.userId = data.id
          })
    }

    const baseUrl = "https://accounts.spotify.com/authorize?";
    const ssoParams = {
      response_type: "token",
      client_id: "b5881a3f486f4533803ebdb7263a5996",
      scope: "playlist-modify-public",
      // redirect_uri: "http://localhost:8080"
      redirect_uri: "https://playlist.builtonbits.com"
    }
    const paramString = new URLSearchParams(Object.entries(ssoParams)).toString()
    self.ssoUrl = baseUrl + paramString
  },
  methods: {
    doSearch: function () {
      console.info('Searching for track')
      const self = this;
      const paramString = new URLSearchParams(Object.entries({
        q: this.trackSearchTerm,
        type: "track",
        limit: 8
      })).toString()

      fetch('https://api.spotify.com/v1/search?' + paramString, {
        headers: {
          "Authorization": "Bearer " + self.token
        }
      })
          .then(response => response.json())
          .then(function (data) {
            self.tracksFound = data.tracks.items
          });
    },
    selectTrack(track) {
      console.debug('Selecting track: ', track)
      this.tracksSelected.push(track);
    },
    unselectTrack(index) {
      console.debug('Unselecting track: ', index)
      this.tracksSelected.splice(index, 1);
    },
    getRecommendations: function () {
      console.info('Get recommendations for track: ', this.trackSearchTerm, ' | ', this.tracksSelected)
      const self = this;
      const seed_tracks = []
      for (const track of self.tracksSelected) {
        seed_tracks.push(track['id'])
      }

      if (self.maxLoudness <= self.minLoudness) {
        alert('Max Loudness must be greater than Min Loudness')
        return
      }
      const params = {
        seed_tracks: seed_tracks.join(','),
        limit: 50
      }
      if (self.maxLoudness < 1) params['max_loudness'] = self.maxLoudness
      if (self.minLoudness > 0) params['min_loudness'] = self.minLoudness

      const paramString = new URLSearchParams(Object.entries(params)).toString()

      fetch('https://api.spotify.com/v1/recommendations?' + paramString, {
        headers: {
          "Authorization": "Bearer " + self.token
        }
      })
          .then(response => response.json())
          .then(function (data) {
            if (data.tracks && data.tracks.length > 0) {
              self.tracksFound = data.tracks
            } else {
              alert('No recommendations found for these songs and settings.')
            }
          });
    },
    addTracks: function (playlistResponse) {
      console.debug('Adding songs to playlist')
      const self = this;
      const playlistUris = []

      for (const track of self.tracksFound) {
        playlistUris.push(track.uri)
      }

      fetch('https://api.spotify.com/v1/playlists/' + playlistResponse.id + '/tracks', {
        headers: {
          "Authorization": "Bearer " + self.token
        },
        method: "POST",
        body: JSON.stringify({
          "uris": playlistUris
        })
      })
          .then(response => response.json())
          .then(function (data) {
            alert('Successfully Saved "' + self.playlistName + '"')
          });
    },
    saveRecommendations: function () {
      console.info('Saving recommendations for track: ', this.trackSelected)
      const self = this;
      fetch('https://api.spotify.com/v1/users/' + self.userId + '/playlists', {
        headers: {
          "Authorization": "Bearer " + self.token
        },
        method: "POST",
        body: JSON.stringify({
          name: this.playlistName,
          description: "Autogenerated Playlist",
          public: true,
          collaborative: false
        })
      })
          .then(response => response.json())
          .then(self.addTracks);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
