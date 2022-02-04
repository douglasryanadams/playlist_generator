<template>
  <div>
    <div v-if="token.length < 1">
      <a
          href="https://accounts.spotify.com/authorize?response_type=token&client_id=b5881a3f486f4533803ebdb7263a5996&scope=playlist-modify-public&redirect_uri=http%3A%2F%2Flocalhost%3A8080"
          class="btn btn-primary"
      >
        Log in
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
      <div v-if="tracksFound.length > 0" class="row m-3 text-center">
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
              v-bind:disabled="trackSelected.length === 0"
              type="button"
              class="btn btn-primary"
          >
            <span v-if="trackSelected.length > 0">Get Recommendations</span>
            <span v-else>Select a Track</span>
          </button>
        </div>
      </div>
      <div v-if="tracksFound.length > 0" class="row">
        <div class="col mx-3">
          <table>
            <thead>
            <tr>
              <th>Track Name</th>
              <th>Artist</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="track in tracksFound" v-on:click="selectTrack(track.id)"
                v-bind:class="{ 'bg-primary': (track.id == trackSelected) , 'text-light': (track.id == trackSelected)}">
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
      <!--      <div>-->
      <!--        UserId: {{ userId }}<br/>-->
      <!--      </div>-->
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
      trackSelected: "",
      tracksFound: [],
      playlistName: "",
      saved: false
    }
  },
  created() {
    console.info('Page loaded')
    const self = this;
    const parsedUrl = new URL(window.location.href)
    const hashValue = parsedUrl.hash
    if (hashValue) {
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
    selectTrack(trackId) {
      this.trackSelected = trackId
    },
    getRecommendations: function () {
      console.info('Get recommendations for track: ', this.trackSearchTerm, ' | ', this.trackSelected)
      const self = this;
      const paramString = new URLSearchParams(Object.entries({
        seed_tracks: this.trackSelected,
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
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

.trackSelected {
  background-color: aquamarine;
}
</style>
