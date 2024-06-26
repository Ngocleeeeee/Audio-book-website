

$(function () {
    var playerTrack = $("#player-track"),
        albumName = $("#album-name"),
        trackName = $("#track-name"),
        albumArt = $("#album-art"),
        sArea = $("#s-area"),
        seekBar = $("#seek-bar"),
        trackTime = $("#track-time"),
        insTime = $("#ins-time"),
        sHover = $("#s-hover"),
        playPauseButton = $("#play-pause-button"),
        i = playPauseButton.find("i"),
        tProgress = $("#current-time"),
        tTime = $("#track-length"),
        seekT,
        seekLoc,
        seekBarPos,
        cM,
        ctMinutes,
        ctSeconds,
        curMinutes,
        curSeconds,
        durMinutes,
        durSeconds,
        playProgress,
        bTime,
        nTime = 0,
        buffInterval = null,
        tFlag = false,
        albums = [
            "Chí phèo",

        ],
        trackNames = [
            "Nam Cao - Chí phèo",

        ],
        albumArtworks = ["_1"],
        trackUrl = [
            "../audio/fpt_bac.mp3",
        ],
        playPreviousTrackButton = $("#play-previous"),
        playNextTrackButton = $("#play-next"),
        currIndex = -1;


    //handle fail and success
    function handleContain(bookId) {
        var isContain = albumArtworks.findIndex((album) => album === "_" + bookId);
        if (isContain != -1) {
            $(`#album-art #_${bookId}`).addClass("active");
            currIndex = isContain;
            currAlbum = albums[currIndex];
            currTrackName = trackNames[currIndex];
            currArtwork = albumArtworks[currIndex];

            audio.src = trackUrl[currIndex];
            albumName.text(currAlbum);
            trackName.text(currTrackName);
            $("#" + currArtwork).addClass("active");
            playPauseButton.click();
            return true;
        };
        return false;
    }

    function handleAddtoPlayer(book) {
        // alert(bookId);
        // Data is returned with array of objects -> to access item[0].<row_name>
        albums.push(book.ten_sach);
        trackNames.push(book.ten_tac_gia + " - " + book.ten_sach);
        albumArtworks.push(book.id);
        trackUrl.push(book.audio);

        // selectTrack(albumArtworks.length-1);
        currIndex = albumArtworks.length - 1;
        currAlbum = albums[currIndex];
        currTrackName = trackNames[currIndex];
        currArtwork = albumArtworks[currIndex];
        audio.src = trackUrl[currIndex];
        albumName.text(currAlbum);
        trackName.text(currTrackName);
        $("#" + currArtwork).addClass("active");
        playPauseButton.click();
        $('#buffer-box').before(book.bia_sach);
    }

    function getAudiobookAPI(book) {
        var book = {
            ten_sach: book.name,
            ten_tac_gia: book.author_name,
            id: "_" + book.id,
            bia_sach: `<img src="${book.images}" id="_${book.id}" class="active" >`,
            audio: book.audio
        }
        handleAddtoPlayer(book);
    }

    //getAUdio - form book (class)
    function getAudioBookDB(bookId) {
        $('#album-art img').each(function () {
            $(this).removeClass("active");
        });
        if (handleContain(bookId)) return;
        $.ajax({
            url: '/audio_book/' + bookId,
            type: 'GET',
            dataType: 'json',
            success: function (item) {
                console.log("selected book:", item);
                var audio_fileName = item[0].audio_fileName;
                var audio_urlLink= item[0].audio_urlLink;
                var audioPlay = "";
                if(audio_fileName==null||audio_fileName==""||audio_fileName==undefined){
                    audioPlay = audio_urlLink;
                }
                else{
                    audioPlay = "../audio/" + audio_fileName;
                }
                
                var book = {
                    ten_sach: item[0].name,
                    ten_tac_gia: item[0].author_name,
                    id: "_" + item[0].id,
                    bia_sach: `<img src="/img/covers/${item[0].image}" id="_${item[0].id}" class="active" >`,
                    audio: audioPlay
                }
                handleAddtoPlayer(book);

            },
            error: function (xhr, status, error) {
                console.log(error);
            }
        });
    }
    $('.book-item .btn-listen').click(function () {
        if ($(this).data('id')) {
            const bookId = $(this).data('id');
            console.log("selectedBookDB: ", $(this).data('book'));
            getAudioBookDB(bookId);
        } else {
            const book = $(this).data('api')
            getAudiobookAPI(book)
        }

    });

    $('.section-banner .current-book-slides .book .action .btn-listen').click(function () {
        if ($(this).data('id')) {
            const bookId = $(this).data('id');
            console.log("selectedBookDB: ", $(this).data('book'));
            getAudioBookDB(bookId);
        } else {
            const book = $(this).data('api')
            getAudiobookAPI(book)
        }

    });
    //getAUdio - trend book (class)
    $('.section-trend .top-trend .action-listen').click(function () {
        if ($(this).data('id')) {
            const bookId = $(this).data('id');
            console.log("selectedBookDB: ", $(this).data('book'));
            getAudioBookDB(bookId);
        } else {
            const book = $(this).data('api')
            getAudiobookAPI(book)
        }

    });

    function bindingFunction() {
        $('.section-trend .user-book .action-listen').click(function () {
            const bookInfor = $(this).data('audio');;
            console.log("selectedBookBrowser: ", bookInfor);
            $('#album-art img').each(function () {
                $(this).removeClass("active");
            });
            if (handleContain(bookInfor.id)) return;
            var book = {
                ten_sach: bookInfor.name,
                ten_tac_gia: bookInfor.author,
                id: "_" + bookInfor.id,
                bia_sach: bookInfor.cover,
                audio: bookInfor.url
            }
            handleAddtoPlayer(book);

        });

        $('.section-trend .user-book .action-trash').click(function () {
            $(this).closest('.book-item').remove();
        });
    }


    $('.output .action .add-list .btn').click(function () {
        bindingFunction();
    });


    function playPause() {
        setTimeout(function () {
            if (audio.paused) {
                playerTrack.addClass("active");
                albumArt.addClass("active");
                checkBuffering();
                i.attr("class", "fas fa-pause");
                audio.play();
            } else {
                playerTrack.removeClass("active");
                albumArt.removeClass("active");
                clearInterval(buffInterval);
                albumArt.removeClass("buffering");
                i.attr("class", "fas fa-play");
                audio.pause();
            }
        }, 300);
    }

    function showHover(event) {
        seekBarPos = sArea.offset();
        seekT = event.clientX - seekBarPos.left;
        seekLoc = audio.duration * (seekT / sArea.outerWidth());

        sHover.width(seekT);

        cM = seekLoc / 60;

        ctMinutes = Math.floor(cM);
        ctSeconds = Math.floor(seekLoc - ctMinutes * 60);

        if (ctMinutes < 0 || ctSeconds < 0) return;

        if (ctMinutes < 0 || ctSeconds < 0) return;

        if (ctMinutes < 10) ctMinutes = "0" + ctMinutes;
        if (ctSeconds < 10) ctSeconds = "0" + ctSeconds;

        if (isNaN(ctMinutes) || isNaN(ctSeconds)) insTime.text("--:--");
        else insTime.text(ctMinutes + ":" + ctSeconds);

        insTime.css({ left: seekT, "margin-left": "-21px" }).fadeIn(0);
    }

    function hideHover() {
        sHover.width(0);
        insTime.text("00:00").css({ left: "0px", "margin-left": "0px" }).fadeOut(0);
    }

    function playFromClickedPos() {
        audio.currentTime = seekLoc;
        seekBar.width(seekT);
        hideHover();
    }

    function updateCurrTime() {
        nTime = new Date();
        nTime = nTime.getTime();

        if (!tFlag) {
            tFlag = true;
            trackTime.addClass("active");
        }

        curMinutes = Math.floor(audio.currentTime / 60);
        curSeconds = Math.floor(audio.currentTime - curMinutes * 60);

        durMinutes = Math.floor(audio.duration / 60);
        durSeconds = Math.floor(audio.duration - durMinutes * 60);

        playProgress = (audio.currentTime / audio.duration) * 100;

        if (curMinutes < 10) curMinutes = "0" + curMinutes;
        if (curSeconds < 10) curSeconds = "0" + curSeconds;

        if (durMinutes < 10) durMinutes = "0" + durMinutes;
        if (durSeconds < 10) durSeconds = "0" + durSeconds;

        if (isNaN(curMinutes) || isNaN(curSeconds)) tProgress.text("00:00");
        else tProgress.text(curMinutes + ":" + curSeconds);

        if (isNaN(durMinutes) || isNaN(durSeconds)) tTime.text("00:00");
        else tTime.text(durMinutes + ":" + durSeconds);

        if (
            isNaN(curMinutes) ||
            isNaN(curSeconds) ||
            isNaN(durMinutes) ||
            isNaN(durSeconds)
        )
            trackTime.removeClass("active");
        else trackTime.addClass("active");

        seekBar.width(playProgress + "%");

        if (playProgress == 100) {
            i.attr("class", "fa fa-play");
            seekBar.width(0);
            tProgress.text("00:00");
            albumArt.removeClass("buffering").removeClass("active");
            clearInterval(buffInterval);
        }
    }

    function checkBuffering() {
        clearInterval(buffInterval);
        buffInterval = setInterval(function () {
            if (nTime == 0 || bTime - nTime > 1000) albumArt.addClass("buffering");
            else albumArt.removeClass("buffering");

            bTime = new Date();
            bTime = bTime.getTime();
        }, 300);
    }

    function selectTrack(flag) {
        if (flag == 0 || flag == 1) ++currIndex;
        else --currIndex;

        if (currIndex > -1 && currIndex < albumArtworks.length) {
            if (flag == 0) i.attr("class", "fa fa-play");
            else {
                albumArt.removeClass("buffering");
                i.attr("class", "fa fa-pause");
            }

            seekBar.width(0);
            trackTime.removeClass("active");
            tProgress.text("00:00");
            tTime.text("00:00");

            currAlbum = albums[currIndex];
            currTrackName = trackNames[currIndex];
            currArtwork = albumArtworks[currIndex];

            audio.src = trackUrl[currIndex];


            nTime = 0;
            bTime = new Date();
            bTime = bTime.getTime();

            if (flag != 0) {
                audio.play();
                playerTrack.addClass("active");
                albumArt.addClass("active");

                clearInterval(buffInterval);
                checkBuffering();
            }

            albumName.text(currAlbum);
            trackName.text(currTrackName);
            albumArt.find("img.active").removeClass("active");
            $("#" + currArtwork).addClass("active");

        } else {
            if (flag == 0 || flag == 1) --currIndex;
            else ++currIndex;
        }
    }

    function initPlayer() {
        audio = new Audio();

        selectTrack(0);

        audio.loop = false;

        playPauseButton.on("click", playPause);

        sArea.mousemove(function (event) {
            showHover(event);
        });

        sArea.mouseout(hideHover);

        sArea.on("click", playFromClickedPos);

        $(audio).on("timeupdate", updateCurrTime);

        playPreviousTrackButton.on("click", function () {
            selectTrack(-1);
        });
        playNextTrackButton.on("click", function () {
            selectTrack(1);
        });
    }

    initPlayer();
});
