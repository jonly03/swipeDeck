import React, {Component} from 'react';
import {View, Stylesheet, Animated} from 'react-native';

class Ball extends Component{
    componentWillMount(){
        this.position = new Animated.ValueXY(0, 0); // Where is the elt at any given moment?

        // Where is the elt moving to?
        Animated.spring(this.position, {
            toValue: {x: 200, y: 500}
        }).start();
    }

    render(){
        return (
            // What elt are we animating? => The ball view
            <Animated.View style={this.position.getLayout()}> 
                <View style={styles.ball}/>
            </Animated.View>
        )
    }
}

const styles = {
    ball:{
        height: 60,
        width: 60,
        borderRadius: 30,
        borderWidth: 30,
        borderColor: 'black'
    }
}

export default Ball;