'use strict'

import React, {Component, StyleSheet, Text, View, PixelRatio, Dimensions, ScrollView, TouchableOpacity} from 'react-native'
import moment from 'moment'

class CalendarHeader extends Component {
    render() {
        const week = ['日', '一', '二', '三', '四', '五', '六']

        return (
            <View style={ [styles.header] }>
                {week.map((day, i) =>
                    <View key={i} style={ [styles.headerCell] }>
                        <Text style={ [styles.headerText, {color: i === 0 || i === 6 ? '#ff3c30' : '#000' }] }>
                            {day}
                        </Text>
                    </View>
                )}
            </View>
        )
    }
}

class MonthHeader extends Component {
    render() {
        const {year, month} = this.props

        return (
            <View style={styles.monthHeader}>
                <Text style={styles.monthHeaderText}>{year}年{month + 1}月</Text>
            </View>
        )
    }
}

class MonthBodyCell extends Component {
    render() {
        const {dayInfo, onPress} = this.props

        const cellDateStyle = [
            styles.monthBodyCellDate,
            dayInfo.active === 'fill'
            ? styles.activeMonthBodyCellDate
            : dayInfo.active === 'border' ? styles.activeMonthBodyCellDateBorder : null,
        ]

        const cellDateTextStyle = [
            styles.text,
            dayInfo.active === 'fill' ? styles.activeMonthBodyCellDateText : null,
            dayInfo.disabled ? styles.disabledText : null
        ]

        return (
            <TouchableOpacity style={styles.monthBodyCell} activeOpacity={1} onPress={onPress ? () => onPress(dayInfo) : null}>
                <View style={cellDateStyle}>
                    <Text style={cellDateTextStyle}>
                        {dayInfo.holiday ? dayInfo.holiday : dayInfo.dateText}
                    </Text>
                </View>
                <View style={[styles.monthBodyCellNote]}>
                    <Text style={[styles.text, styles.monthBodyCellNoteText]}>
                        {dayInfo.note}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }
}

class MonthBody extends Component {
    render() {
        const {displayFormat, year, month, holiday, active, note, onPress} = this.props

        // generate day cell
        let startDay = moment().year(year).month(month).date(1),
            endDay = moment().year(year).month(month).date(1).add(1, 'month'),
            dayCells = {}

        while(endDay.isAfter(startDay, 'day')){
            dayCells = {
                ...dayCells,
                [startDay.format(displayFormat)]: {
                    date: new Date(startDay.startOf('day').valueOf()),
                    dateText: startDay.date(),
                    disabled: startDay.isBefore(moment().subtract(1, 'day')),
                }
            }
            startDay = startDay.add(1, 'day')
        }

        // add addFeatures
        this.addFeature('holiday', holiday, dayCells)
        this.addFeature('active', active, dayCells)
        this.addFeature('note', note, dayCells)

        // generate blanks
        const blanksNum = moment().year(year).month(month).date(1).day()

        return (
            <View style={styles.monthBody}>
                {Array.apply(0, Array(blanksNum)).map(function (x, i) {
                    return <View key={i} style={ [styles.monthBodyCell] }></View>
                })}
                {Object.keys(dayCells).map((date, i) =>
                    <MonthBodyCell
                        key={i}
                        dayInfo={dayCells[date]}
                        onPress={onPress}
                    />
                )}
            </View>
        )
    }
    addFeature(featureName, featureContent, dayCells) {
        Object.keys(featureContent).map((date) => {
            const formatDate = moment(date, this.props.parseFormat).format(this.props.displayFormat)
            if(dayCells[formatDate]){
                dayCells[formatDate][featureName] = featureContent[date]
            }
        })
    }
}
MonthBody.defaultProps = {
    parseFormat: 'YYYY-M-D',
    displayFormat: 'YYYY-MM-DD'
}

class Calendar extends Component {
    render() {
        let {startTime, endTime} = this.props
        startTime = moment.isMoment(startTime) ? startTime : moment(startTime)
        endTime = moment.isMoment(endTime) ? endTime : moment(endTime)

        // generate months
        let months = [],
            stickyHeaderIndices = []

        while(endTime.isSameOrAfter(startTime, 'day')){
            months = [
                ...months,
                {
                    type: 'header',
                    year: startTime.year(),
                    month: startTime.month()
                },
                {
                    type: 'body',
                    year: startTime.year(),
                    month: startTime.month()
                }
            ]
            stickyHeaderIndices = [
                ...stickyHeaderIndices,
                stickyHeaderIndices.length * 2
            ]
            startTime = startTime.add(1, 'month')
        }
        return (
            <View style={styles.container}>
                <CalendarHeader />
                <ScrollView stickyHeaderIndices={stickyHeaderIndices}>
                    {months.map((monthItem, i) =>
                        monthItem.type === 'header'
                        ? <MonthHeader key={i} year={monthItem.year} month={monthItem.month}/>
                        : <MonthBody key={i} year={monthItem.year} month={monthItem.month} {...this.props}/>
                    )}
                </ScrollView>
            </View>
        )
    }
}
Calendar.defaultProps = {
    startTime: moment(),
    endTime: moment().add(5, 'month')
}

const DateCellSize = (Dimensions.get('window').width - 1) / 7
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // common
    text: {
        fontSize: 14,
        textAlign: 'center',
    },
    disabledText: {
        color: '#c7ced4',
    },

    // header
    header: {
        flexDirection: 'row',
        height: 15,
        backgroundColor: '#fff',
    },
    headerCell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 10,
    },

    // month header
    monthHeader: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1 / PixelRatio.get(),
        borderBottomColor: '#dce1e6',
    },
    monthHeaderText: {
        fontSize: 18,
    },

    // month body
    monthBody: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    // month body cell
    monthBodyCell: {
        width: DateCellSize,
        height: DateCellSize + 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthBodyCellDate: {
        width: DateCellSize,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthBodyCellNote: {
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthBodyCellNoteText: {
        color: '#1ba9ba',
        fontSize: 12,
    },
    activeMonthBodyCellDate: {
        width: 32,
        backgroundColor: '#1ba9ba',
        borderRadius: 16,
    },
    activeMonthBodyCellDateBorder: {
        width: 32,
        borderWidth: 2 / PixelRatio.get(),
        borderColor: '#1ba9ba',
        borderRadius: 16,
    },
    activeMonthBodyCellDateText: {
        color: '#fff',
    },
})

module.exports = Calendar
