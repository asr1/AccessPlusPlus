//Blob.js //Used for file saving
! function(a) {
    "use strict";
    if (a.URL = a.URL || a.webkitURL, a.Blob && a.URL) try {
        return void new Blob
    } catch (b) {}
    var c = a.BlobBuilder || a.WebKitBlobBuilder || a.MozBlobBuilder || function(a) {
            var b = function(a) {
                return Object.prototype.toString.call(a).match(/^\[object\s(.*)\]$/)[1]
            }, c = function() {
                    this.data = []
                }, d = function(a, b, c) {
                    this.data = a, this.size = a.length, this.type = b, this.encoding = c
                }, e = c.prototype,
                f = d.prototype,
                g = a.FileReaderSync,
                h = function(a) {
                    this.code = this[this.name = a]
                }, i = "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR".split(" "),
                j = i.length,
                k = a.URL || a.webkitURL || a,
                l = k.createObjectURL,
                m = k.revokeObjectURL,
                n = k,
                o = a.btoa,
                p = a.atob,
                q = a.ArrayBuffer,
                r = a.Uint8Array,
                s = /^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/;
            for (d.fake = f.fake = !0; j--;) h.prototype[i[j]] = j + 1;
            return k.createObjectURL || (n = a.URL = function(a) {
                var b, c = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
                return c.href = a, "origin" in c || ("data:" === c.protocol.toLowerCase() ? c.origin = null : (b = a.match(s), c.origin = b && b[1])), c
            }), n.createObjectURL = function(a) {
                var b, c = a.type;
                return null === c && (c = "application/octet-stream"), a instanceof d ? (b = "data:" + c, "base64" === a.encoding ? b + ";base64," + a.data : "URI" === a.encoding ? b + "," + decodeURIComponent(a.data) : o ? b + ";base64," + o(a.data) : b + "," + encodeURIComponent(a.data)) : l ? l.call(k, a) : void 0
            }, n.revokeObjectURL = function(a) {
                "data:" !== a.substring(0, 5) && m && m.call(k, a)
            }, e.append = function(a) {
                var c = this.data;
                if (r && (a instanceof q || a instanceof r)) {
                    for (var e = "", f = new r(a), i = 0, j = f.length; j > i; i++) e += String.fromCharCode(f[i]);
                    c.push(e)
                } else if ("Blob" === b(a) || "File" === b(a)) {
                    if (!g) throw new h("NOT_READABLE_ERR");
                    var k = new g;
                    c.push(k.readAsBinaryString(a))
                } else a instanceof d ? "base64" === a.encoding && p ? c.push(p(a.data)) : "URI" === a.encoding ? c.push(decodeURIComponent(a.data)) : "raw" === a.encoding && c.push(a.data) : ("string" != typeof a && (a += ""), c.push(unescape(encodeURIComponent(a))))
            }, e.getBlob = function(a) {
                return arguments.length || (a = null), new d(this.data.join(""), a, "raw")
            }, e.toString = function() {
                return "[object BlobBuilder]"
            }, f.slice = function(a, b, c) {
                var e = arguments.length;
                return 3 > e && (c = null), new d(this.data.slice(a, e > 1 ? b : this.data.length), c, this.encoding)
            }, f.toString = function() {
                return "[object Blob]"
            }, f.close = function() {
                this.size = 0, delete this.data
            }, c
        }(a);
    a.Blob = function(a, b) {
        var d = b ? b.type || "" : "",
            e = new c;
        if (a)
            for (var f = 0, g = a.length; g > f; f++) e.append(a[f]);
        return e.getBlob(d)
    }
}("undefined" != typeof self && self || "undefined" != typeof window && window || this.content || this);
var saveAs = saveAs || "undefined" != typeof navigator && navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator) || function(a) {
        "use strict";
        if ("undefined" == typeof navigator || !/MSIE [1-9]\./.test(navigator.userAgent)) {
            var b = a.document,
                c = function() {
                    return a.URL || a.webkitURL || a
                }, d = b.createElementNS("http://www.w3.org/1999/xhtml", "a"),
                e = !a.externalHost && "download" in d,
                f = function(c) {
                    var d = b.createEvent("MouseEvents");
                    d.initMouseEvent("click", !0, !1, a, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, null), c.dispatchEvent(d)
                }, g = a.webkitRequestFileSystem,
                h = a.requestFileSystem || g || a.mozRequestFileSystem,
                i = function(b) {
                    (a.setImmediate || a.setTimeout)(function() {
                        throw b
                    }, 0)
                }, j = "application/octet-stream",
                k = 0,
                l = 10,
                m = function(b) {
                    var d = function() {
                        "string" == typeof b ? c().revokeObjectURL(b) : b.remove()
                    };
                    a.chrome ? d() : setTimeout(d, l)
                }, n = function(a, b, c) {
                    b = [].concat(b);
                    for (var d = b.length; d--;) {
                        var e = a["on" + b[d]];
                        if ("function" == typeof e) try {
                            e.call(a, c || a)
                        } catch (f) {
                            i(f)
                        }
                    }
                }, o = function(b, i) {
                    var l, o, p, q = this,
                        r = b.type,
                        s = !1,
                        t = function() {
                            n(q, "writestart progress write writeend".split(" "))
                        }, u = function() {
                            if ((s || !l) && (l = c().createObjectURL(b)), o) o.location.href = l;
                            else {
                                var d = a.open(l, "_blank");
                                void 0 == d && "undefined" != typeof safari && (a.location.href = l)
                            }
                            q.readyState = q.DONE, t(), m(l)
                        }, v = function(a) {
                            return function() {
                                return q.readyState !== q.DONE ? a.apply(this, arguments) : void 0
                            }
                        }, w = {
                            create: !0,
                            exclusive: !1
                        };
                    return q.readyState = q.INIT, i || (i = "download"), e ? (l = c().createObjectURL(b), d.href = l, d.download = i, f(d), q.readyState = q.DONE, t(), void m(l)) : (a.chrome && r && r !== j && (p = b.slice || b.webkitSlice, b = p.call(b, 0, b.size, j), s = !0), g && "download" !== i && (i += ".download"), (r === j || g) && (o = a), h ? (k += b.size, void h(a.TEMPORARY, k, v(function(a) {
                        a.root.getDirectory("saved", w, v(function(a) {
                            var c = function() {
                                a.getFile(i, w, v(function(a) {
                                    a.createWriter(v(function(c) {
                                        c.onwriteend = function(b) {
                                            o.location.href = a.toURL(), q.readyState = q.DONE, n(q, "writeend", b), m(a)
                                        }, c.onerror = function() {
                                            var a = c.error;
                                            a.code !== a.ABORT_ERR && u()
                                        }, "writestart progress write abort".split(" ").forEach(function(a) {
                                            c["on" + a] = q["on" + a]
                                        }), c.write(b), q.abort = function() {
                                            c.abort(), q.readyState = q.DONE
                                        }, q.readyState = q.WRITING
                                    }), u)
                                }), u)
                            };
                            a.getFile(i, {
                                create: !1
                            }, v(function(a) {
                                a.remove(), c()
                            }), v(function(a) {
                                a.code === a.NOT_FOUND_ERR ? c() : u()
                            }))
                        }), u)
                    }), u)) : void u())
                }, p = o.prototype,
                q = function(a, b) {
                    return new o(a, b)
                };
            return p.abort = function() {
                var a = this;
                a.readyState = a.DONE, n(a, "abort")
            }, p.readyState = p.INIT = 0, p.WRITING = 1, p.DONE = 2, p.error = p.onwritestart = p.onprogress = p.onwrite = p.onabort = p.onerror = p.onwriteend = null, q
        }
    }("undefined" != typeof self && self || "undefined" != typeof window && window || this.content);
"undefined" != typeof module && null !== module ? module.exports = saveAs : "undefined" != typeof define && null !== define && null != define.amd && define([], function() {
    return saveAs
});
var ics = function() {
    "use strict";
    if (navigator.userAgent.indexOf("MSIE") > -1 && -1 == navigator.userAgent.indexOf("MSIE 10")) return void console.log("Unsupported Browser");
    var a = -1 !== navigator.appVersion.indexOf("Win") ? "\r\n" : "\n",
        b = [],
        c = ["BEGIN:VCALENDAR", "VERSION:2.0"].join(a),
        d = a + "END:VCALENDAR";
    return {
        events: function() {
            return b
        },
        calendar: function() {
            return c + a + b.join(a) + d
        },
        addEvent: function(c, d, e, f, g, h) {
            if ("undefined" == typeof c || "undefined" == typeof d || "undefined" == typeof e || "undefined" == typeof f || "undefined" == typeof g) return !1;
            if (h && !h.rule) {
                if ("YEARLY" !== h.freq && "MONTHLY" !== h.freq && "WEEKLY" !== h.freq && "DAILY" !== h.freq) throw "Recurrence rule frequency must be provided and be one of the following: 'YEARLY', 'MONTHLY', 'WEEKLY', or 'DAILY'";
                if (h.until && isNaN(Date.parse(h.until))) throw "Recurrence rule 'until' must be a valid date string";
                if (h.interval && isNaN(parseInt(h.interval))) throw "Recurrence rule 'interval' must be an integer";
                if (h.count && isNaN(parseInt(h.count))) throw "Recurrence rule 'count' must be an integer"
            }
            var i = new Date(f),
                j = new Date(g),
                k = ("0000" + i.getFullYear().toString()).slice(-4),
                l = ("00" + (i.getMonth() + 1).toString()).slice(-2),
                m = ("00" + i.getDate().toString()).slice(-2),
                n = ("00" + i.getHours().toString()).slice(-2),
                o = ("00" + i.getMinutes().toString()).slice(-2),
                p = ("00" + i.getMinutes().toString()).slice(-2),
                q = ("0000" + j.getFullYear().toString()).slice(-4),
                r = ("00" + (j.getMonth() + 1).toString()).slice(-2),
                s = ("00" + j.getDate().toString()).slice(-2),
                t = ("00" + j.getHours().toString()).slice(-2),
                u = ("00" + j.getMinutes().toString()).slice(-2),
                v = ("00" + j.getMinutes().toString()).slice(-2),
                w = "",
                x = "";
            o + p + u + v !== 0 && (w = "T" + n + o + p, x = "T" + t + u + v);
            var y, z = k + l + m + w,
                A = q + r + s + x;
            if (h)
                if (h.rule) y = h.rule;
                else {
                    if (y = "RRULE:FREQ=" + h.freq, h.until) {
                        var B = new Date(Date.parse(h.until)).toISOString();
                        y += ";UNTIL=" + B.substring(0, B.length - 13).replace(/[-]/g, "") + "000000Z"
                    }
                    h.interval && (y += ";INTERVAL=" + h.interval), h.count && (y += ";COUNT=" + h.count)
                }
            var C = ["BEGIN:VEVENT", "CLASS:PUBLIC", "DESCRIPTION:" + d, "DTSTART;VALUE=DATE:" + z, "DTEND;VALUE=DATE:" + A, "LOCATION:" + e, "SUMMARY;LANGUAGE=en-us:" + c, "TRANSP:OPAQUE", "END:VEVENT"];
            return y && C.splice(4, 0, y), C = C.join(a), b.push(C), C
        },
        download: function(e, f) {
            if (b.length < 1) return !1;
            f = "undefined" != typeof f ? f : ".ics", e = "undefined" != typeof e ? e : "calendar";
            var g, h = c + a + b.join(a) + d;
            if (-1 === navigator.userAgent.indexOf("MSIE 10")) g = new Blob([h]);
            else {
                var i = new BlobBuilder;
                i.append(h), g = i.getBlob("text/x-vCalendar;charset=" + document.characterSet)
            }
            return saveAs(g, e + f), h
        }
    }
};

//ICS.js //Used for calendar Creation
//This is a heacily modified version of ICS.js, with comments indicating most modifications.
var ics = function() {
    'use strict';

    if (navigator.userAgent.indexOf('MSIE') > -1 && navigator.userAgent.indexOf('MSIE 10') == -1) {
        console.log('Unsupported Browser');
        return;
    }

    var SEPARATOR = (navigator.appVersion.indexOf('Win') !== -1) ? '\r\n' : '\n';
    var calendarEvents = [];
    var calendarStart = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0'
    ].join(SEPARATOR);
    var calendarEnd = SEPARATOR + 'END:VCALENDAR';

    return {
        /**
         * Returns events array
         * @return {array} Events
         */
        'events': function() {
            return calendarEvents;
        },

        /**
         * Returns calendar
         * @return {string} Calendar in iCalendar format
         */
        'calendar': function() {
            return calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;
        },

        /**
         * Add event to the calendar
         * @param  {string} subject     Subject/Title of event
         * @param  {string} description Description of event
         * @param  {string} location    Location of event
         * @param  {string} begin       Beginning date of event
         * @param  {string} stop        Ending date of event
         * @param  {string} rrule       Reccurrance rule for events
         * @param  {string} days        Days of the week to repeat on
         * @Param  string} exdates      Dates to ignore (holidays)
         */
        'addEvent': function(subject, description, location, begin, stop, rrule, days, exdates) {
            // I'm not in the mood to make these optional... So they are all required 
            if (typeof subject === 'undefined' ||
                typeof description === 'undefined' ||
                typeof location === 'undefined' ||
                typeof begin === 'undefined' ||
                typeof stop === 'undefined'
            ) {
                return false;
            }

            // validate rrule
            if (rrule) {//This lets us use repeating evets. Presently we create a rule of weekly until end date in CreateSchedule()
              if (!rrule.rule) {
                if (rrule.freq !== 'YEARLY' && rrule.freq !== 'MONTHLY' && rrule.freq !== 'WEEKLY' && rrule.freq !== 'DAILY') {
                  throw "Recurrence rule frequency must be provided and be one of the following: 'YEARLY', 'MONTHLY', 'WEEKLY', or 'DAILY'";
                }

                if (rrule.until) {
                  if (isNaN(Date.parse(rrule.until))) {
                    throw "Recurrence rule 'until' must be a valid date string";
                  }
                }

                if (rrule.interval) {
                  if (isNaN(parseInt(rrule.interval))) {
                    throw "Recurrence rule 'interval' must be an integer";
                  }
                }

                if (rrule.count) {
                  if (isNaN(parseInt(rrule.count))) {
                    throw "Recurrence rule 'count' must be an integer";
                  }
                }
              }
            }

            //TODO add time and time zone? use moment to format?
            var start_date = new Date(begin);
            var end_date = new Date(stop);
			
            var start_year = ("0000" + (start_date.getFullYear().toString())).slice(-4);
            var start_month = ("00" + ((start_date.getMonth() + 1).toString())).slice(-2);
            var start_day = ("00" + ((start_date.getDate()).toString())).slice(-2);
            var start_hours = ("00" + (start_date.getHours().toString())).slice(-2);
            var start_minutes = ("00" + (start_date.getMinutes().toString())).slice(-2);
            var start_seconds = ("00" + (start_date.getSeconds().toString())).slice(-2);

            var end_year = ("0000" + (end_date.getFullYear().toString())).slice(-4);
            var end_month = ("00" + ((end_date.getMonth() + 1).toString())).slice(-2);
            var end_day = ("00" + ((end_date.getDate()).toString())).slice(-2);
            var end_hours = ("00" + (end_date.getHours().toString())).slice(-2);
            var end_minutes = ("00" + (end_date.getMinutes().toString())).slice(-2);
            var end_seconds = ("00" + (end_date.getSeconds().toString())).slice(-2);

            // Since some calendars don't add 0 second events, we need to remove time if there is none...
            var start_time = '';
            var end_time = '';
            if (start_minutes + start_seconds + end_minutes + end_seconds !== 0) {
                start_time = 'T' + start_hours + start_minutes + start_seconds;
                end_time = 'T' + end_hours + end_minutes + end_seconds;
            }

            var start = start_year + start_month + start_day + start_time;
            var end = end_year + end_month + end_day + end_time;
			
            // recurrence rule vars
            var rruleString;
            if (rrule) {
              if (rrule.rule) {
                rruleString = rrule.rule;
              } else {
                rruleString = 'RRULE:FREQ=' + rrule.freq;

                if (rrule.until) {
                  var uDate = new Date(Date.parse(rrule.until)).toISOString();
                  rruleString += ';UNTIL=' + uDate.substring(0, uDate.length - 13).replace(/[-]/g, '') + '000000Z';
                }

                if (rrule.interval) {
                  rruleString += ';INTERVAL=' + rrule.interval;
                }

                if (rrule.count) {
                  rruleString += ';COUNT=' + rrule.count;
                }
				
		if(days)
		{
			rruleString+=';BYDAY=' + days;
		}
              }
            }
            var calendarEvent = [
                'BEGIN:VEVENT',
                'CLASS:PUBLIC',
		        'TZID:US/Central', //Force Central
                'DESCRIPTION:' + description,
                'DTSTART;VALUE=DATE-TIME:' + start,
                'DTEND;VALUE=DATE-TIME:' + end,
                'LOCATION:' + location,
                'SUMMARY;LANGUAGE=en-us:' + subject,
				'EXDATE;TZID=US-Central:' + exdates,  //Force Central, exdates is a formatted string containing dates to skip (Holidays), as per the RRUle standard.
		        'TRANSP:OPAQUE',
                'END:VEVENT'
            ];

            if (rruleString) {
              calendarEvent.splice(4, 0, rruleString);
            }

            calendarEvent = calendarEvent.join(SEPARATOR);
			
            calendarEvents.push(calendarEvent);
            return calendarEvent;
        },

        /**
         * Download calendar using the saveAs function from filesave.js
         * @param  {string} filename Filename
         * @param  {string} ext      Extention
         */
        'download': function(filename, ext) {
            if (calendarEvents.length < 1) {
                return false;
            }

            ext = (typeof ext !== 'undefined') ? ext : '.ics';
            filename = (typeof filename !== 'undefined') ? filename : 'calendar';
            var calendar = calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;

            var blob;
            if (navigator.userAgent.indexOf('MSIE 10') === -1) { // chrome or firefox
                blob = new Blob([calendar]);
            } else { // ie
                var bb = new BlobBuilder();
                bb.append(calendar);
                blob = bb.getBlob('text/x-vCalendar;charset=' + document.characterSet);
            }
            saveAs(blob, "ISU Class Schedule" + ext);//Name the calendar appropriately.
            return calendar;
        }
    };
};

//Check if the current date falls on thanksgiving
function is_Thanksgiving(dtdate){
	// check simple dates (month/date - no leading zeroes)
    var dt_date = new Date(dtdate);//We have to "typecast"
	
	var n_date = dt_date.getDate(),
	n_month = dt_date.getMonth() + 1;
	var s_date1 = n_month + '/' + n_date;


	// weekday from beginning of the month (month/num/day)
	var n_wday = dt_date.getDay(),

		n_wnum = Math.floor((n_date - 1) / 7) + 1;

	var s_date2 = n_month + '/' + n_wnum + '/' + n_wday;

	
	if ( s_date2 == '11/4/4' )// Thanksgiving Day, fourth Thursday in November
	{
		return true;
	}
	return false;
}

//What is this camel/snake case?
function check_springBreak()
{
	var today = new Date();
	return is_SpringBreak(today.getFullYear()) || is_SpringBreak(today.getFullYear() + 1);
}

//Check if the current date falls on spring break 
function is_SpringBreak(year){
        var today = new Date();
        
        var springBreak = new Date ("March 17, " + year); 
		
		//If march 17 is on a sturday, move bacwards until we get to a sunday
		//If march 17 is on a sunday, move forwards until we get to a sunday
		//Move forward and backwards until we get to a sunday
		
		 //Do while in case today is sunday, we still do the next week.
        do{
            springBreak.setDate(springBreak.getDate() + 1);
			if(today == springBreak)
			{
				return true;
			}
        }
		while (springBreak.getDay() != 0);
		
		//Reset spring break!
		springBreak = new Date ("March 17, " + date.getFullYear());
		
		//But if it's a sunday, we don't want to go backwards! We only get one week off!
		while (springBreak.getDay() != 0){
            springBreak.setDate(springBreak.getDate() - 1);
			if(today == springBreak)
			{
				return true;
			}
        }

		return false;
}

//Returns true on a University holiday (4th of July, Reverend Doctor Martin Luther King, Jr. Day, Thanksgiving Week, Memorial Day, Labour day.)
//And Returns false on every other day.
function iSholiday (dtdate) {

	var dt_date = new Date(dtdate);//We have to "typecast"

	// check simple dates (month/date - no leading zeroes)
	var n_date = dt_date.getDate(),
	n_month = dt_date.getMonth() + 1;
	var s_date1 = n_month + '/' + n_date;

		

	if (  s_date1 == '7/4'   // Independence Day
	) return true;

	// weekday from beginning of the month (month/num/day)

	var n_wday = dt_date.getDay(),

		n_wnum = Math.floor((n_date - 1) / 7) + 1;

	var s_date2 = n_month + '/' + n_wnum + '/' + n_wday;

	if (   s_date2 == '1/3/1'  // Birthday of Martin Luther King, third Monday in January

		|| s_date2 == '9/1/1'  // Labor Day, first Monday in September
        
        || check_springBreak()

		//Check if it's Thanksgiving week
		|| is_Thanksgiving(dt_date) //Set modifies the dates, so this addition looks weird.
		|| is_Thanksgiving(dt_date.setDate(dt_date.getDate() - 1)) //Black Friday
		|| is_Thanksgiving(dt_date.setDate(dt_date.getDate() + 2)) //Wednesday
		|| is_Thanksgiving(dt_date.setDate(dt_date.getDate() + 1)) //Tuesday
		|| is_Thanksgiving(dt_date.setDate(dt_date.getDate() + 1)) //Monday
	) return true;
	
	// weekday number from end of the month (month/num/day)
	var dt_temp = new Date (dt_date);

	dt_temp.setDate(1);

	dt_temp.setMonth(dt_temp.getMonth() + 1);

	dt_temp.setDate(dt_temp.getDate() - 1);

	n_wnum = Math.floor((dt_temp.getDate() - n_date - 1) / 7) + 1;

	var s_date3 = n_month + '/' + n_wnum + '/' + n_wday;

	if (   s_date3 == '5/1/1'  // Memorial Day, last Monday in May

	) return true;

	return false;

}
