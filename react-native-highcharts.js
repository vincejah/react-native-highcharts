import React, { Component } from 'react'
import { StyleSheet, View, WebView, Dimensions } from 'react-native'
import { Highcharts, HighchartsMore, MomentJs, MomentJsTimezone } from './Resources'
const { height, width } = Dimensions.get('window')

class ChartWeb extends Component {
  constructor (props) {
    super(props)
    this.state = {
      height,
      width
    }
  }
  createChartHTML (config, options) {
    return `<html>
        <head>
          <style media="screen" type="text/css">#container{width:100%;height:100%;top:0;left:0;right:0;bottom:0;position:absolute;}</style>
            <script>${Highcharts}</script>
            <script>${HighchartsMore}</script>
            <script>${MomentJs}</script>
            <script>${MomentJsTimezone}</script>
            <script>
              document.addEventListener("DOMContentLoaded", function() {
                ${this.props.options ? 'Highcharts.setOptions(' + options + ')' : null}
                Highcharts.${this.props.stock ? 'stockChart' : 'chart'}('container', ${config});
              });
            </script>
        </head>
        <body>
            <div id="container" />
        </body>
    </html>`
  }
  // used to resize on orientation of display
  reRenderWebView (e) {
    this.setState({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width
    })
  }

  render () {
    const config = JSON.parse(JSON.stringify(this.props.config, function (key, value) {
      // create string of json but if it detects function it uses toString()
      return (typeof value === 'function') ? value.toString() : value
    }))
    const options = JSON.parse(JSON.stringify(this.props.options, function (key, value) {
      // create string of json but if it detects function it uses toString()
      return (typeof value === 'function') ? value.toString() : value
    }))

    const concatHTML = this.createChartHTML(flattenObject(config), flattenObject(options))

    return (
      <View style={this.props.style}>
        <WebView
          onLayout={this.reRenderWebView}
          style={styles.full}
          source={{ html: concatHTML, baseUrl: 'web/' }}
          javaScriptEnabled
          domStorageEnabled
          scalesPageToFit
          scrollEnabled={false}
          automaticallyAdjustContentInsets
        />
      </View>
    )
  };
};

var flattenObject = function (obj, str = '{') {
  Object.keys(obj).forEach(function (key) {
    str += `${key}: ${flattenText(obj[key])}, `
  })
  return `${str.slice(0, str.length - 2)}}`
}

var flattenText = function (item) {
  var str = ''
  if (item && typeof item === 'object' && item.length === undefined) {
    str += flattenObject(item)
  } else if (item && typeof item === 'object' && item.length !== undefined) {
    str += '['
    item.forEach(function (k2) {
      str += `${flattenText(k2)}, `
    })
    str = str.slice(0, str.length - 2)
    str += ']'
  } else if (typeof item === 'string' && item.slice(0, 8) === 'function') {
    str += `${item}`
  } else if (typeof item === 'string') {
    str += `"${item.replace(/"/g, '\\"')}"`
  } else {
    str += `${item}`
  }
  return str
}

var styles = StyleSheet.create({
  full: {
    flex: 1,
    backgroundColor: 'transparent'
  }
})

module.exports = ChartWeb
