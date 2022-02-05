<template>
  <div>
    <div v-if="token.length < 1" class="text-center m-5">
      <a
          v-bind:href="ssoUrl"
          class="btn btn-success"
      >
        Click to log in with Spotify!
      </a>
    </div>

    <div v-if="token.length > 0">
      <div class="row my-3">
        <div class="col mx-5">
          <form v-on:submit="doSearch">
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

      <div v-if="tracksFound.length > 0" class="row m-5 text-center">
        <div class="col">
          <div class="row text-left">
            <!--        <label v-if="tracksFound.length > 8" for="playlistName" class="col col-form-label-lg">Playlist Name</label>-->
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

      <div v-if="tracksFound.length > 0" class="row mt-5">
        <div class="col mx-5">
          <h3 v-if="tracksFound.length > 8">Recommended Songs</h3>
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

      <div class="row m-5">
        <div class="col">
          <p>
            This site allows you to generate and save a Spotify Playlist!
          </p>
          <ol>
            <li>Search for a song</li>
            <li>Select the correct song</li>
            <li>Click 'Get Recommendations'</li>
            <li>Enter a name for the playlist</li>
            <li>Click 'Save Playlist'</li>
            <li>Open Spotify and find your playlist added!</li>
          </ol>
        </div>
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
      saved: false,
      ssoUrl: ""
    }
  },
  created() {
    console.info('Page loaded')
    const self = this;
    const parsedUrl = new URL(window.location.href)
    const hashValue = parsedUrl.hash

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
          .then(data => (self.userId = data.id))
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
          "Authorization": "Bearer " + this.token
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
      const paramString = new URLSearchParams(Object.entries({
        seed_tracks: seed_tracks.join(','),
        limit: 50
      })).toString()

      fetch('https://api.spotify.com/v1/recommendations?' + paramString, {
        headers: {
          "Authorization": "Bearer " + self.token
        }
      })
          .then(response => response.json())
          .then(function (data) {
            self.tracksFound = data.tracks
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
          .then(data => function (data) {
            self.saved = true
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
