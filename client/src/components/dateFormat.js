export default function dateFormat(date) {
    date = new Date(date);

    let today = new Date();
    let difference = (today - date) / 1000;

    if (difference < 60) {
        return difference + " seconds ago";
    }
    else if (difference >= 60 && difference < 3600) {
        return (difference/60).toFixed(2) + " minutes ago";
    }
    else if (difference >= 3600 && difference < 86400) {
        return (difference/3600).toFixed(2) + " hours ago";
    }
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    let month = monthNames[date.getMonth()];
    let day = date.getDate();
    let year = date.getFullYear();
    let hour = date.getHours();
    let min = date.getMinutes();

    if (hour < 10) {
        hour = "0" + hour;
    }

    if (min < 10) {
        min = "0" + min;
    }

    return month + " " + day + ", " + year + " at " + hour + ":" + min;
}