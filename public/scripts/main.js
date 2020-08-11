

function upvote() {
    // console.log("upvote")
    const votes = event.target.parentElement.nextElementSibling.innerText
    const id = event.target.parentElement.nextElementSibling.attributes.id.value

    let xhr = new XMLHttpRequest()

    xhr.open('POST', '/vote', true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    //xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onload = function () {
        //console.log(this)
        if (this.status == 200 && !this.responseText.includes("<!DOCTYPE html>")) {
            const data = JSON.parse(this.responseText)
            document.getElementById(id).innerHTML = `${data.votes}`
            document.getElementById(`up${id}`).disabled = data.disabled.up
            document.getElementById(`down${id}`).disabled = data.disabled.down
        } else {
            document.getElementById(id).innerHTML = "sign in to vote"
        }
    }
    xhr.send(JSON.stringify({
        id: id,
        votes: votes,
        direction: "up"
    }))

}

function downvote() {
    // console.log("downvote")
    const votes = event.target.parentElement.previousElementSibling.innerText
    const id = event.target.parentElement.previousElementSibling.attributes.id.value

    let xhr = new XMLHttpRequest()

    xhr.open('POST', '/vote', true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    //xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onload = function () {
        if (this.status == 200 && !this.responseText.includes("<!DOCTYPE html>")) {
            const data = JSON.parse(this.responseText)
            document.getElementById(id).innerHTML = `${data.votes}`
            document.getElementById(`up${id}`).disabled = data.disabled.up
            document.getElementById(`down${id}`).disabled = data.disabled.down
        } else {
            document.getElementById(id).innerHTML = "sign in to vote"
        }
    }
    xhr.send(JSON.stringify({
        id: id,
        votes: votes,
        direction: "down"
    }))

}

const ups = document.getElementsByName("upvote")
ups.forEach((element) => { element.addEventListener("click", upvote) })

const downs = document.getElementsByName("downvote")
downs.forEach((element) => { element.addEventListener("click", downvote) })
