import React, {Component} from 'react';
import {View, 
    Animated,
    Dimensions,
    LayoutAnimation,
    UIManager,
    PanResponder // We need to create an instance of it right away in our constructor
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component{
    // Accepts 
    //  `data`, `renderCard`, `renderNoMoreCards`, onSwipeRight`, and `onSwipeLeft`
    // as props
    static defaultProps = {
        // Default props to avoid errors if the user of our components did pass them to us
        onSwipeRight: () => {},
        onSwipeLeft: () => {},
        _renderNoMoreCards: () => {}
    }

    constructor(props){
        super(props);

        // Self-contained object that we don't have to set on the state
        this._position = new Animated.ValueXY();

        // Self-contained object that we don't have to set on the state
        this._panResponder = PanResponder.create({
            // Called when user touches on the screen
            // Returning true sets this view to be the responder for that touch action
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                // Called when the user is moving their finger
                // The gesture argument has a `dx` and `dy` properties which tell us of how far in the x and y direction the user moved their fingers
                // We use dx and dy to update the Animated module's position every time the user moves their fingers
                // We will use the Animated.View to animate our view
                this._position.setValue({x: gesture.dx, y:gesture.dy});
            },
            onPanResponderRelease: (event, gesture) => {
                // on 'touchUp'
                // Fired at the end of the touch
                
                if (gesture.dx > SWIPE_THRESHOLD){
                    // Swipe right
                    this._forceSwipe('right');

                } else if (gesture.dx < -SWIPE_THRESHOLD){
                    // Swipe left
                    this._forceSwipe('left');

                } else{
                    // Spring the card back into place
                    this._resetPosition();
                }
            }
        });

        this.state = {index: 0};

    }

    componentWillReceiveProps(nextProps){
        // Make sure to reset our index piece of state when we receive new data to render
        if (nextProps.data !== this.props.data){
            this.setState({index: 0});
        }
    }

    componentDidUpdate(){
        // Make the update (i.e the top margin change) smooth
        
        // Android
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

        LayoutAnimation.spring();
    }

    _onSwipeComplete(direction){

        const {onSwipeRight, onSwipeLeft, data} = this.props;
        const currentItem = data[this.state.index];

        direction === 'right' ? onSwipeRight(currentItem) : onSwipeLeft(currentItem);

        // reset our position and increment index piece of state
        this._position.setValue({x: 0, y: 0});
        this.setState({index: this.state.index + 1}); // triggers component to be rendered
    }

    _forceSwipe(direction){
        // Animate.timing vs Animate.spring
        const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;

        Animated.timing(this._position, {
            toValue: {x, y: 0},
            duration: SWIPE_OUT_DURATION
        }).start(() => this._onSwipeComplete(direction))
    }

    _resetPosition(){
        // Animate.spring => bounce to it
        Animated.spring(this._position, {
            toValue: {x: 0, y:0}
        }).start();
    }

    _getCardStyle(){
        // Relate the amount of translation to amount of rotation the view experiences
        const rotate = this._position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5], // Horizontal scale
            outputRange:['-120deg', '0deg', '120deg'] // Rotation scale
        })
        return {
            ...this._position.getLayout(),
            transform: [{rotate}]
        };
    }

    _renderCards(){
        if (this.state.index >= this.props.data.length){
            return this.props.renderNoMoreCards();
        }

        // Loops through the data and renders each item
        return this.props.data.map((item, eltIdx) => {
            if (eltIdx < this.state.index){
                // Don't render it
                return null;
            }
            else if (eltIdx === this.state.index){
                // Attach panHandlers & render it
                return (
                    <Animated.View
                        key = {eltIdx}
                        style={[this._getCardStyle(), styles.card_style]}
                        {...this._panResponder.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                )
            }

            // Otherwise, just render the card
            return (
                // Render an Animated.View instead of View to avoid the image flash caused by a View being promoted to an Animated.View
                <Animated.View 
                    key={eltIdx} 
                    style={[styles.card_style, {top: 10 * (eltIdx - this.state.index)}]}
                    // top: 10 * eltIdx - this.state.index to cascade the cards nicely
                >
                    {this.props.renderCard(item)}
                </Animated.View>
            )
        }).reverse(); // When the cards stack up, the last one is on top. Reverse the deck to fix that
    }

    render(){
        return (
            <View>
                {this._renderCards()}
            </View>
        );
    }
}

const styles = {
    // Make the cards stack up on top of each other
    card_style:{
        position: 'absolute',
        width: SCREEN_WIDTH
    }
}

export default Deck;