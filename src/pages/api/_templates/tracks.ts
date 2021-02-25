interface GetHTMLProps {
  range: string;
  data: Array<Spotify.Artist | Spotify.Tracks>;
  profile: Spotify.PrivateUser | undefined;
}

interface Map {
  [key: string]: string;
}

const range_text: Map = {
  short_term: 'from last 4 weeks',
  medium_term: 'from last 6 months',
  long_term: 'from all time',
};

export function getTracksHtml({ range, data: tracks, profile }: GetHTMLProps) {
  const data = tracks as Array<Spotify.Tracks>;

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>tracks_${range}</title>
  
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@100&display=swap"
        rel="stylesheet"
      />
  
      <style>
        * {
          padding: 0;
          margin: 0;
          box-sizing: border-box;
          font-family: Roboto Mono, monospace;
          -webkit-text-size-adjust: none;
          font-size-adjust: none;
        }

        .brand-color {
          color: #ee1f9d;
        }

        .secondary-color {
          color: #dbfa84;
        }

        .brand-background {
          background-color: #ee1f9d;
        }

        .wrapper {
          height: 100vh;
          width: 100%;
          padding: 128px 32px 32px 32px;
        }

        .bunchify_logo {
          position: absolute;
          width: 200px;
          top: 80px;
          right: 32px;
        }

        .content {
          width: 100%;
          height: 100%;
          background-color: #181818;
        }

        .header {
          display: flex;
          max-height: 10vh;
          width: 100%;
        }

        .profile {
          display: flex;
          flex-grow: 1;
          flex-shrink: 2;
          align-items: center;
          padding: 32px 0 32px 32px;
        }

        .profile__avatar {
          background-image: url('${profile?.images[0].url}');
          background-size: cover;
          background-position: center center;
          width: 64px;
          height: 64px;
          border-radius: 100%;
        }

        .profile__name {
          margin-left: 8px;
          width: auto;
          font-size: 1.8vh;
          color: #ffffff;
        }

        .spotify img {
          display: flex;
          flex-shrink: 1;
          margin: 32px;
        }

        .title {
          display: flex;
          flex-direction: column;
          height: 10vh;
          width: 100%;
          padding: 0 32px;
          line-height: 1;
        }

        .title h1 {
          margin-left: 8px;
          font-size: 3vh;
          font-weight: 600;
        }

        .title h2 {
          font-size: 4.8vh;
          font-weight: 800;
        }

        .title h3 {
          margin-left: 8px;
          margin-top: 0.2vh;
          font-size: 2vh;
        }

        .top {
          display: flex;
          width: 100%;
          padding: 0 16px;
          position: relative;
        }

        .container_top_1 {
          margin-top: 4vh;
          height: 20vh;
          margin-bottom: 2vh;
        }

        .top_1 {
          flex-direction: column;
          align-items: center;
        }

        .top_1 img {
          height: 15vh;
        }

        .top_1 h1 {
          margin-top: 0.5vh;
          font-size: 2.2vh;
          line-height: 1;
        }

        .top_1 h2 {
          margin-top: 0.2vh;
          font-size: 1.8vh;
          line-height: 1;
        }

        .container_top_3 {
          margin-top: 3vh;
          height: 18vh;
          display: flex;
        }

        .top_3 {
          flex-direction: column;
          align-items: center;
          padding: 0 16px;
        }

        .top_3 img {
          height: 10vh;
        }

        .top_3 h1 {
          margin-top: 0.5vh;
          font-size: 2vh;
          line-height: 1;
          text-align: center;
        }

        .top_3 h2 {
          margin-top: 0.2vh;
          font-size: 1.6vh;
          line-height: 1;
        }

        .container_top_5 {
          margin-top: 3vh;
          height: 20vh;
          display: flex;
          flex-direction: column;
          padding: 0 32px;
        }

        .info_top_5 {
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin-left: 32px
        }

        .top_5 {
          flex-direction: row;
          margin-bottom: 2vh;
          padding-left: 64px;
        }

        .top_5 img {
          height: 8vh;
        }

        .top_5 h1 {
          margin-top: 0.5vh;
          font-size: 2vh;
          line-height: 1;
        }

        .top_5 h2 {
          margin-top: 0.2vh;
          font-size: 1.6vh;
          line-height: 1;
        }

        .position {
          font-size: 2vh;
          position: absolute;
          left: 32px;
          color: #fff;
          font-weight: 800;
        }

        .position_first {
          font-size: 3vh;
          left: 64px;
        }

        .position_inline {
          left: 0px;
        }
      </style>
    </head>
    <body>
      <main class="wrapper brand-background">
        <img class="bunchify_logo" src="https://bunchify.app/Bunchify_Typo_White.svg">
        <div class="content">
          <div class="header">
            <div class="profile">
              <div class="profile__avatar"></div>
              <h1 class="profile__name">/${profile?.id}</h1>
            </div>
  
            <div class="spotify">
              <img src="https://bunchify.app/Spotify_Logo_RGB_White.png" height="64px" />
            </div>
          </div>
  
          <div class="title">
            <h1 class="brand-color">Your Top</h1>
            <h2 class="secondary-color">TRACKS</h2>
            <h3 class="brand-color">${range_text[range]}</h3>
          </div>
  
          <div class="container_top_1">
            <div class="top top_1">
              <span class="position position_first">1.</span>
              <img src="${data[0].album.images[1].url}" />
              <h1 class="secondary-color">${data[0].name}</h1>
              <h2 class="brand-color">${data[0].artists[0].name}</h2>
            </div>
          </div>
  
          <div class="container_top_3">
            <div class="top top_3">
              <span class="position">2.</span>
              <img src="${data[1].album.images[1].url}" />
              <h1 class="secondary-color">${data[1].name}</h1>
              <h2 class="brand-color">${data[1].artists[0].name}</h2>
            </div>
  
            <div class="top top_3">
              <span class="position">3.</span>
              <img src="${data[2].album.images[1].url}" />
              <h1 class="secondary-color">${data[2].name}</h1>
              <h2 class="brand-color">${data[2].artists[0].name}</h2>
            </div>
          </div>
  
          <div class="container_top_5">
            <div class="top top_5">
              <span class="position position_inline">4.</span>
              <img src="${data[3].album.images[1].url}" />
              <div class="info_top_5">
                <h1 class="secondary-color">${data[3].name}</h1>
                <h2 class="brand-color">${data[3].artists[0].name}</h2>
              </div>
            </div>
  
            <div class="top top_5">
              <span class="position position_inline">5.</span>
              <img src="${data[4].album.images[1].url}" />
              <div class="info_top_5">
                <h1 class="secondary-color">${data[4].name}</h1>
                <h2 class="brand-color">${data[4].artists[0].name}</h2>
              </div>
            </div>
          </div>
        </div>
      </main>
    </body>
  </html>
  `;
}
